/**
 * Strictly typed rate limit actions
 * Prevents arbitrary strings from being used in rate limiting
 */
export type RateLimitAction =
  // Authentication actions
  | 'auth_login'
  | 'auth_signup'
  | 'auth_refresh'

  // Mission actions
  | 'mission_create'
  | 'mission_update'
  | 'mission_read'
  | 'mission_archive'
  | 'mission_delete'

  // Quest actions
  | 'quest_create'
  | 'quest_update'
  | 'quest_complete'
  | 'quest_read'
  | 'quest_delete'

  // Commander actions
  | 'commander_read'
  | 'commander_update_stats'
  | 'commander_update_preferences'

  // Analytics
  | 'calculate_analytics'

  // Archive actions
  | 'archive_search'
  | 'archive_read'

  // General actions
  | 'search'
  | 'bulk_operation'
  | 'feedback_submit';

/**
 * Rate limit configuration for each action type
 */
export interface RateLimitConfig {
  /** Number of requests allowed */
  limit: number;
  /** Time window (e.g., '1 m', '1 h', '1 d') */
  window: string;
  /** Human readable description */
  description: string;
}

/**
 * Rate limit result from Redis
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Rate limit log event data
 */
export interface RateLimitLogEvent {
  userId: string;
  action: RateLimitAction;
  limitValue: number;
  currentCount: number;
  windowMs: number;
  exceeded: boolean;
  rateLimiterEnabled: boolean;
  userAgent?: string;
  ipAddress?: string;
}
