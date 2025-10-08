import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { checkRateLimit as checkRateLimitImpl } from '@/lib/rate-limits/rate-limiter';
import type { RateLimitAction } from '@/lib/rate-limits/types';
import {
  AuthenticationError,
  RateLimitError,
  type ErrorContext,
} from '@/lib/errors';

/**
 * Centralized authentication helper for server actions and queries
 * Returns the authenticated user ID or throws an error
 */
export async function requireAuth(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new AuthenticationError();
  }

  return session.user.id;
}

/**
 * Get current user session (optional auth)
 * Returns session or null if not authenticated
 */
export async function getCurrentSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user ? session : null;
}

/**
 * Rate limiting implementation using Upstash Redis
 * Enforces typed actions to prevent arbitrary rate limit keys
 */
export async function checkRateLimit(
  userId: string,
  action: RateLimitAction,
  context: ErrorContext = {}
): Promise<void> {
  const result = await checkRateLimitImpl(userId, action);

  if (!result.success) {
    const errorContext = { ...context, userId, action };
    throw new RateLimitError(errorContext);
  }
}
