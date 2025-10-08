import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';
import { nextCookies } from 'better-auth/next-js';
import { account, session, user, verification } from '@/db/schema';
import { eq } from 'drizzle-orm';

function validateAuthConfig() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!googleClientId) {
    throw new Error('GOOGLE_CLIENT_ID environment variable is required');
  }

  if (!googleClientSecret) {
    throw new Error('GOOGLE_CLIENT_SECRET environment variable is required');
  }

  if (!githubClientId) {
    throw new Error('GITHUB_CLIENT_ID environment variable is required');
  }

  if (!githubClientSecret) {
    throw new Error('GITHUB_CLIENT_SECRET environment variable is required');
  }

  return {
    GOOGLE_CLIENT_ID: googleClientId,
    GOOGLE_CLIENT_SECRET: googleClientSecret,
    GITHUB_CLIENT_ID: githubClientId,
    GITHUB_CLIENT_SECRET: githubClientSecret,
  };
}

const authConfig = validateAuthConfig();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: authConfig.GOOGLE_CLIENT_ID,
      clientSecret: authConfig.GOOGLE_CLIENT_SECRET,
    },
    github: {
      enabled: true,
      clientId: authConfig.GITHUB_CLIENT_ID,
      clientSecret: authConfig.GITHUB_CLIENT_SECRET,
    },
  },
  plugins: [nextCookies()],
});

// Utility functions for onboarding status
export async function getUserOnboardingStatus(
  userId: string
): Promise<boolean> {
  try {
    const result = await db
      .select({ onboardingCompleted: user.onboardingCompleted })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return result[0]?.onboardingCompleted || false;
  } catch (error) {
    console.error('Error fetching user onboarding status:', error);
    return false;
  }
}

export async function setUserOnboardingCompleted(
  userId: string
): Promise<void> {
  try {
    await db
      .update(user)
      .set({
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));
  } catch (error) {
    console.error('Error updating user onboarding status:', error);
    throw error;
  }
}
