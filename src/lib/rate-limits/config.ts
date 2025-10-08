import type { RateLimitAction, RateLimitConfig } from './types';

/**
 * Centralized rate limit configuration
 * All rate limits are defined here for easy management
 */
export const RATE_LIMIT_CONFIG: Record<RateLimitAction, RateLimitConfig> = {
  // Authentication - strict limits to prevent brute force
  auth_login: {
    limit: 5,
    window: '15 m',
    description: 'Login attempts per 15 minutes',
  },
  auth_signup: {
    limit: 3,
    window: '1 h',
    description: 'Signup attempts per hour',
  },
  auth_refresh: {
    limit: 10,
    window: '1 m',
    description: 'Token refresh per minute',
  },

  // Mission operations - moderate limits for CRUD operations
  mission_create: {
    limit: 10,
    window: '1 h',
    description: 'Mission creation per hour',
  },
  mission_update: {
    limit: 30,
    window: '1 h',
    description: 'Mission updates per hour',
  },
  mission_read: {
    limit: 100,
    window: '1 h',
    description: 'Mission reads per hour',
  },
  mission_archive: {
    limit: 20,
    window: '1 h',
    description: 'Mission archive operations per hour',
  },
  mission_delete: {
    limit: 10,
    window: '1 h',
    description: 'Mission deletion per hour',
  },

  // Quest operations - higher limits as they're more frequent
  quest_create: {
    limit: 20,
    window: '1 h',
    description: 'Quest creation per hour',
  },
  quest_update: {
    limit: 50,
    window: '1 h',
    description: 'Quest updates per hour',
  },
  quest_complete: {
    limit: 30,
    window: '1 h',
    description: 'Quest completions per hour',
  },
  quest_read: {
    limit: 200,
    window: '1 h',
    description: 'Quest reads per hour',
  },
  quest_delete: {
    limit: 15,
    window: '1 h',
    description: 'Quest deletion per hour',
  },

  // Commander operations - personal settings updates
  commander_read: {
    limit: 100,
    window: '1 h',
    description: 'Commander data reads per hour',
  },
  commander_update_stats: {
    limit: 10,
    window: '1 h',
    description: 'Commander stats updates per hour',
  },
  commander_update_preferences: {
    limit: 20,
    window: '1 h',
    description: 'Commander preference updates per hour',
  },

  // Analytics
  calculate_analytics: {
    limit: 30,
    window: '1 h',
    description: 'Analytics calculations per hour',
  },

  // Archive operations - search can be expensive
  archive_search: {
    limit: 20,
    window: '1 h',
    description: 'Archive searches per hour',
  },
  archive_read: {
    limit: 100,
    window: '1 h',
    description: 'Archive reads per hour',
  },

  // General operations
  search: {
    limit: 50,
    window: '1 h',
    description: 'General searches per hour',
  },
  bulk_operation: {
    limit: 5,
    window: '1 h',
    description: 'Bulk operations per hour',
  },
  feedback_submit: {
    limit: 100,
    window: '1 h',
    description: 'Feedback submissions per hour',
  },
};
