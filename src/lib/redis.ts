import Redis from 'ioredis';

/**
 * Self-hosted Redis client for rate limiting
 * Will gracefully handle connection failures and continue without Redis
 * Uses globalThis to ensure single instance in development
 */

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    maxRetriesPerRequest: 0,
    lazyConnect: true,
    retryStrategy: (times: number) => {
      if (times > 1) {
        return null;
      }
      return 1000;
    },
  });

// Store Redis instance globally to ensure singleton pattern
globalForRedis.redis = redis;

/**
 * Redis health status cache
 */
let lastHealthCheck = 0;
let cachedHealthStatus = true;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Health check for Redis connection with caching
 * Used for monitoring and fallback decisions
 * Caches the result for 30 seconds to avoid checking on every request
 */
export async function checkRedisHealth(): Promise<boolean> {
  const now = Date.now();

  // Return cached status if within interval
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return cachedHealthStatus;
  }

  try {
    const result = await redis.ping();
    cachedHealthStatus = result === 'PONG';
    lastHealthCheck = now;

    if (!cachedHealthStatus) {
      console.warn('Redis health check failed: unexpected ping response');
    }

    return cachedHealthStatus;
  } catch {
    cachedHealthStatus = false;
    lastHealthCheck = now;
    return false;
  }
}
