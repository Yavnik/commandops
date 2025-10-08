import { redis } from '@/lib/redis';
import { getRateLimitStats } from './logger';

/**
 * Admin utilities for managing rate limiter
 */

/**
 * Enable rate limiting globally
 */
export async function enableRateLimiting(): Promise<void> {
  await redis.set('co:rate_limiter:enabled', 'true');
}

/**
 * Disable rate limiting globally
 */
export async function disableRateLimiting(): Promise<void> {
  await redis.set('co:rate_limiter:enabled', 'false');
}

/**
 * Check if rate limiting is currently enabled
 */
export async function isRateLimitingEnabled(): Promise<boolean> {
  try {
    const enabled = await redis.get('co:rate_limiter:enabled');
    return enabled === 'true';
  } catch (error) {
    console.warn('Failed to check rate limiting status:', error);
    return false;
  }
}

/**
 * Get comprehensive rate limiting status and statistics
 */
export async function getRateLimitingStatus(): Promise<{
  enabled: boolean;
  stats: Awaited<ReturnType<typeof getRateLimitStats>>;
}> {
  const [enabled, stats] = await Promise.all([
    isRateLimitingEnabled(),
    getRateLimitStats(),
  ]);

  return { enabled, stats };
}

/**
 * Clear all rate limit data from Redis (for testing/reset)
 * WARNING: This will remove all rate limit counters
 */
export async function clearAllRateLimits(): Promise<void> {
  const keys = await redis.keys('co:rate_limit:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
