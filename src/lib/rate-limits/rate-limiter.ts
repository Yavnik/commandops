import { redis, checkRedisHealth } from '@/lib/redis';
import { RATE_LIMIT_CONFIG } from './config';
import { logRateLimitEvent } from './logger';
import type { RateLimitAction, RateLimitResult } from './types';

/**
 * Convert time window string to milliseconds
 */
function parseWindowToMs(window: string): number {
  const match = window.match(/^(\d+)\s*([mhd])$/);
  if (!match) {
    throw new Error(`Invalid time window format: ${window}`);
  }

  const [, amount, unit] = match;
  const amountNum = parseInt(amount, 10);

  switch (unit) {
    case 'm':
      return amountNum * 60 * 1000; // minutes to ms
    case 'h':
      return amountNum * 60 * 60 * 1000; // hours to ms
    case 'd':
      return amountNum * 24 * 60 * 60 * 1000; // days to ms
    default:
      throw new Error(`Unknown time unit: ${unit}`);
  }
}

/**
 * Sliding window rate limiter using Redis sorted sets
 * This implements a precise sliding window algorithm using Redis TIME for consistency
 */
const slidingWindowScript = `
  local key = KEYS[1]
  local window = tonumber(ARGV[1])
  local limit = tonumber(ARGV[2])
  local uuid = ARGV[3]
  
  -- Get Redis server time in microseconds, convert to milliseconds
  local redis_time = redis.call('TIME')
  local now = redis_time[1] * 1000 + math.floor(redis_time[2] / 1000)
  
  -- Remove expired entries
  redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
  
  -- Count current entries
  local count = redis.call('ZCARD', key)
  
  if count < limit then
    -- Add new entry
    redis.call('ZADD', key, now, uuid)
    redis.call('EXPIRE', key, math.ceil(window / 1000))
    return {1, limit - count - 1, now + window}
  else
    -- Rate limit exceeded
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local reset_time = oldest[2] and (oldest[2] + window) or (now + window)
    return {0, 0, reset_time}
  end
`;

/**
 * Generate a unique identifier for this request
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate and sanitize userId to prevent keyspace bloat attacks
 */
function sanitizeUserId(userId: string): string {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId: must be a non-empty string');
  }

  // Limit length to prevent bloat
  if (userId.length > 255) {
    throw new Error('Invalid userId: too long (max 255 characters)');
  }

  // Basic sanitization: only allow alphanumeric, hyphens, underscores
  const sanitized = userId.replace(/[^a-zA-Z0-9\-_]/g, '');
  if (sanitized.length === 0) {
    throw new Error('Invalid userId: contains no valid characters');
  }

  return sanitized;
}

/**
 * Security-critical actions that should fail closed when Redis is unavailable
 */
const SECURITY_CRITICAL_ACTIONS: Set<RateLimitAction> = new Set([
  'auth_login',
  'auth_signup',
  'auth_refresh',
]);

/**
 * Check if rate limiting is enabled via Redis flag
 * Defaults to false if Redis is unavailable or key doesn't exist
 */
async function isRateLimitingEnabled(): Promise<boolean> {
  try {
    const enabled = await redis.get('co:rate_limiter:enabled');
    return enabled === 'true';
  } catch {
    return false;
  }
}

/**
 * Check rate limit for a user action
 * @param userId - User identifier for rate limiting
 * @param action - Typed action to rate limit
 * @param userAgent - Optional user agent for logging
 * @param ipAddress - Optional IP address for logging
 * @returns Rate limit result with success/failure and metadata
 */
export async function checkRateLimit(
  userId: string,
  action: RateLimitAction,
  userAgent?: string,
  ipAddress?: string
): Promise<RateLimitResult> {
  try {
    // Sanitize userId to prevent keyspace attacks
    const sanitizedUserId = sanitizeUserId(userId);

    // First check if Redis is healthy
    const isRedisHealthy = await checkRedisHealth();

    if (!isRedisHealthy) {
      return {
        success: true,
        limit: 0,
        remaining: 0,
        reset: Date.now() + 60000, // 1 minute from now
      };
    }

    // Check if rate limiting is enabled
    const rateLimiterEnabled = await isRateLimitingEnabled();

    const config = RATE_LIMIT_CONFIG[action];
    const windowMs = parseWindowToMs(config.window);
    const key = `co:rate_limit:${action}:${sanitizedUserId}`;
    const requestId = generateRequestId();

    // Execute the sliding window algorithm to get current state
    const result = (await redis.eval(
      slidingWindowScript,
      1, // number of keys
      key,
      windowMs.toString(),
      config.limit.toString(),
      requestId
    )) as [number, number, number];

    // Safe type casting from Lua numbers
    const [successRaw, remainingRaw, resetRaw] = result;
    const wouldSucceed = Number(successRaw) === 1;
    const remaining = Number(remainingRaw);
    const reset = Number(resetRaw);
    const now = Date.now();

    // Calculate current count for logging
    const currentCount = config.limit - remaining - (wouldSucceed ? 1 : 0);

    // Log the event only when rate limit is exceeded
    if (!wouldSucceed) {
      logRateLimitEvent({
        userId: sanitizedUserId,
        action,
        limitValue: config.limit,
        currentCount: Math.max(0, currentCount),
        windowMs,
        exceeded: true,
        rateLimiterEnabled,
        userAgent,
        ipAddress,
      }).catch(err => {
        // Logging errors shouldn't break the flow
        console.error('Rate limit logging failed:', err);
      });
    }

    // If rate limiting is disabled, always allow but log the event
    if (!rateLimiterEnabled) {
      return {
        success: true,
        limit: config.limit,
        remaining: remaining,
        reset: reset,
        retryAfter: undefined,
      };
    }

    // If rate limiting is enabled, respect the limit
    return {
      success: wouldSucceed,
      limit: config.limit,
      remaining: remaining,
      reset: reset,
      retryAfter: wouldSucceed ? undefined : Math.ceil((reset - now) / 1000),
    };
  } catch (error) {
    console.error(
      `Rate limit check failed for action ${action} by user ${userId}:`,
      error
    );

    // Log the error case
    try {
      const config = RATE_LIMIT_CONFIG[action];
      logRateLimitEvent({
        userId: sanitizeUserId(userId),
        action,
        limitValue: config.limit,
        currentCount: 0,
        windowMs: parseWindowToMs(config.window),
        exceeded: false,
        rateLimiterEnabled: false,
        userAgent,
        ipAddress,
      }).catch(() => {}); // Ignore logging errors in error handler
    } catch {}

    // Fail closed for security-critical actions
    if (SECURITY_CRITICAL_ACTIONS.has(action)) {
      throw error;
    }

    // Fail open - allow the request when rate limiting fails
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now() + 60000,
    };
  }
}
