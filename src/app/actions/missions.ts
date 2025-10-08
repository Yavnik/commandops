'use server';

import { db } from '@/db';
import { missions, quests } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';
import { requireAuth, checkRateLimit } from '@/lib/auth/middleware';
import { AuthorizationError, DatabaseError } from '@/lib/errors';
import { safeServerAction } from '@/lib/error-handler';
import {
  validateCreateMissionInput,
  validateUpdateMissionInput,
  archiveMissionSchema,
  validateDeleteMissionInput,
} from '@/lib/auth/validation';
import { getMissionById } from '@/lib/queries/missions';

export interface CreateMissionInput {
  title: string;
  objective?: string;
}

export interface UpdateMissionInput {
  title?: string;
  objective?: string | null;
  status?: 'ACTIVE' | 'ARCHIVED';
}

/**
 * Server action to create a new mission
 */
export async function createMissionAction(input: CreateMissionInput) {
  return safeServerAction(
    async () => {
      const userId = await requireAuth();
      await checkRateLimit(userId, 'mission_create');

      const validatedInput = validateCreateMissionInput(input);
      const missionId = nanoid();
      const now = new Date();

      const [newMission] = await db
        .insert(missions)
        .values({
          id: missionId,
          title: validatedInput.title,
          objective: validatedInput.objective || null,
          status: 'ACTIVE',
          userId,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      if (!newMission) {
        throw new DatabaseError();
      }

      revalidatePath('/missions');
      revalidatePath('/dashboard');

      // Add quest counts for compatibility with Mission type
      return {
        ...newMission,
        totalQuestCount: 0,
        completedQuestCount: 0,
      };
    },
    {
      action: 'create_mission',
      resource: 'mission',
      userId: undefined, // Will be set after requireAuth
      additionalData: { title: input.title, has_objective: !!input.objective },
    }
  );
}

/**
 * Server action to update an existing mission
 */
export async function updateMissionAction(
  missionId: string,
  updates: UpdateMissionInput
) {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'mission_update');

    const validatedUpdates = validateUpdateMissionInput(updates);

    // Verify mission ownership first
    await getMissionById(missionId);

    const [updatedMission] = await db
      .update(missions)
      .set({
        ...validatedUpdates,
        updatedAt: new Date(),
      })
      .where(and(eq(missions.id, missionId), eq(missions.userId, userId)))
      .returning();

    if (!updatedMission) {
      throw new AuthorizationError();
    }

    revalidatePath('/missions');
    revalidatePath('/dashboard');

    // Add quest counts for compatibility with Mission type
    const questCounts = await db
      .select({
        total: sql<number>`cast(count(*) as int)`,
        completed: sql<number>`cast(count(*) filter (where ${quests.status} = 'COMPLETED') as int)`,
      })
      .from(quests)
      .where(eq(quests.missionId, missionId));

    const counts = questCounts[0] || { total: 0, completed: 0 };

    return {
      ...updatedMission,
      totalQuestCount: counts.total,
      completedQuestCount: counts.completed,
    };
  });
}

// Archive mission with after action report and quest archival
export async function archiveMissionAction(
  missionId: string,
  afterActionReport?: string
) {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'mission_archive');

    // Validate input
    const validated = archiveMissionSchema.parse({
      missionId,
      afterActionReport,
    });

    // Verify mission ownership first
    await getMissionById(missionId);

    const now = new Date();

    // Use transaction to archive mission and all related quests
    const result = await db.transaction(async tx => {
      // First, archive all quests in the mission
      await tx
        .update(quests)
        .set({
          status: 'ARCHIVED',
          updatedAt: now,
        })
        .where(and(eq(quests.missionId, missionId), eq(quests.userId, userId)));

      // Then, archive the mission with optional after action report
      const [archivedMission] = await tx
        .update(missions)
        .set({
          status: 'ARCHIVED',
          archivedAt: now,
          afterActionReport: validated.afterActionReport || null,
          updatedAt: now,
        })
        .where(and(eq(missions.id, missionId), eq(missions.userId, userId)))
        .returning();

      if (!archivedMission) {
        throw new AuthorizationError();
      }

      return archivedMission;
    });

    revalidatePath('/dashboard');
    revalidatePath('/missions');
    return result;
  });
}

// Delete mission and handle associated quests
export async function deleteMissionAction(
  missionId: string,
  deleteQuests: boolean = false
) {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'mission_delete');

    // Validate input
    const validated = validateDeleteMissionInput({ missionId, deleteQuests });

    // Verify mission ownership first
    await getMissionById(validated.missionId);

    // Start transaction
    await db.transaction(async tx => {
      // First, handle associated quests
      if (validated.deleteQuests) {
        // Delete all quests associated with this mission
        await tx
          .delete(quests)
          .where(
            and(
              eq(quests.missionId, validated.missionId),
              eq(quests.userId, userId)
            )
          );
      } else {
        // Set missionId to null for all associated quests (orphan them)
        await tx
          .update(quests)
          .set({
            missionId: null,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(quests.missionId, validated.missionId),
              eq(quests.userId, userId)
            )
          );
      }

      // Then delete the mission
      const [deletedMission] = await tx
        .delete(missions)
        .where(
          and(eq(missions.id, validated.missionId), eq(missions.userId, userId))
        )
        .returning();

      if (!deletedMission) {
        throw new AuthorizationError();
      }
    });

    revalidatePath('/dashboard');
    revalidatePath('/missions');
  });
}
