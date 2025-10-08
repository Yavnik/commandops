'use server';

import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, checkRateLimit } from '@/lib/auth/middleware';
import { NotFoundError } from '@/lib/errors';
import { safeServerAction } from '@/lib/error-handler';

/**
 * Commander data - essential fields for commander display
 */
export async function getCommanderData(): Promise<{
  id: string;
  username: string;
  email: string;
} | null> {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'commander_read');

    const result = await db
      .select({
        id: user.id,
        username: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return result[0] || null;
  });
}

/**
 * Get current user's profile information
 */
export async function getCurrentUser() {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'commander_read');

    const [userProfile] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        onboardingCompleted: user.onboardingCompleted,
      })
      .from(user)
      .where(eq(user.id, userId));

    if (!userProfile) {
      throw new NotFoundError();
    }

    return userProfile;
  });
}
