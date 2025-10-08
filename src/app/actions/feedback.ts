'use server';

import { db } from '@/db';
import { feedback } from '@/db/schema';
import { nanoid } from 'nanoid';
import { requireAuth, checkRateLimit } from '@/lib/auth/middleware';
import { safeServerAction } from '@/lib/error-handler';
import { validateCreateFeedbackInput } from '@/lib/auth/validation';

export interface CreateFeedbackInput {
  message: string;
}

/**
 * Submit user feedback
 */
export async function submitFeedbackAction(data: CreateFeedbackInput) {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'feedback_submit');

    const validatedData = validateCreateFeedbackInput(data);

    const [newFeedback] = await db
      .insert(feedback)
      .values({
        id: nanoid(),
        userId,
        message: validatedData.message,
      })
      .returning();

    return newFeedback;
  });
}
