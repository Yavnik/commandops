'use server';

import { db } from '@/db';
import { quests } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';
import { requireAuth, checkRateLimit } from '@/lib/auth/middleware';
import {
  AuthorizationError,
  BusinessLogicError,
  DatabaseError,
} from '@/lib/errors';
import { safeServerAction } from '@/lib/error-handler';
import {
  validateCreateQuestInput,
  validateUpdateQuestInput,
  validateCompleteQuestInput,
  validateActivateQuestInput,
  validateDeleteQuestInput,
  validateUpdateQuestStatusInput,
} from '@/lib/auth/validation';
import { getQuestById, getActiveQuestCount } from '@/lib/queries/quests';
import { QuestStatus } from '@/types';

// Types aligned with V2 PRD schema
export type DebriefSatisfaction = 1 | 2 | 3 | 4 | 5;

export interface CreateQuestInput {
  title: string;
  description?: string;
  missionId?: string;
  isCritical?: boolean;
  deadline?: Date;
  estimatedTime?: number; // in minutes
}

export interface UpdateQuestInput {
  title?: string;
  description?: string | null;
  missionId?: string | null;
  isCritical?: boolean;
  deadline?: Date | null;
  estimatedTime?: number | null;
}

export interface CompleteQuestInput {
  actualTime?: number; // in minutes
  debriefNotes?: string;
  debriefSatisfaction?: number; // 1-5 satisfaction rating
}

export interface ActivateQuestInput {
  firstTacticalStep?: string; // The first physical action to begin
  estimatedTime?: number; // Updated time estimate in minutes
  isEmergencyDeploy?: boolean; // Allow 4th active quest
}

// Create a new quest
export async function createQuestAction(data: CreateQuestInput) {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'quest_create');

    const validatedData = validateCreateQuestInput(data);

    const [newQuest] = await db
      .insert(quests)
      .values({
        id: nanoid(),
        userId,
        title: validatedData.title,
        description: validatedData.description,
        missionId: validatedData.missionId,
        isCritical: validatedData.isCritical || false,
        deadline: validatedData.deadline,
        estimatedTime: validatedData.estimatedTime,
        status: 'PLANNING',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!newQuest) {
      throw new DatabaseError();
    }

    revalidatePath('/dashboard');
    return newQuest;
  });
}

// Activate quest with deployment protocol (V2 PRD requirement)
export async function activateQuestAction(
  questId: string,
  deploymentData: ActivateQuestInput
) {
  return safeServerAction(
    async () => {
      const userId = await requireAuth();
      await checkRateLimit(userId, 'quest_update');

      const validatedData = validateActivateQuestInput(deploymentData);

      // Verify quest ownership first
      await getQuestById(questId);

      // Check current active quest count
      const currentActiveCount = await getActiveQuestCount();

      // Enforce 3-quest limit unless emergency deploy
      if (currentActiveCount >= 3 && !validatedData.isEmergencyDeploy) {
        throw new BusinessLogicError(
          'Maximum of 3 active quests allowed. Use emergency deploy to override.'
        );
      }

      // Emergency deploy warning (allows 4th quest)
      if (currentActiveCount >= 4) {
        throw new BusinessLogicError(
          'Emergency deploy limit exceeded. Cannot have more than 4 active quests.'
        );
      }

      // Update quest to active with deployment data
      const updateData: {
        status: 'ACTIVE';
        startedAt: Date;
        updatedAt: Date;
        firstTacticalStep?: string;
        estimatedTime?: number;
      } = {
        status: 'ACTIVE',
        startedAt: new Date(),
        updatedAt: new Date(),
      };

      // Add optional deployment data
      if (validatedData.firstTacticalStep) {
        updateData.firstTacticalStep = validatedData.firstTacticalStep;
      }
      if (validatedData.estimatedTime) {
        updateData.estimatedTime = validatedData.estimatedTime;
      }

      const [activatedQuest] = await db
        .update(quests)
        .set(updateData)
        .where(and(eq(quests.id, questId), eq(quests.userId, userId)))
        .returning();

      if (!activatedQuest) {
        throw new AuthorizationError();
      }

      revalidatePath('/dashboard');
      return {
        quest: activatedQuest,
        isEmergencyDeploy: currentActiveCount >= 3,
        activeCount: currentActiveCount + 1,
      };
    },
    {
      action: 'activate_quest',
      resource: 'quest',
      userId: undefined, // Will be set after requireAuth
      additionalData: {
        quest_id: questId,
        is_emergency_deploy: deploymentData.isEmergencyDeploy,
        has_tactical_step: !!deploymentData.firstTacticalStep,
      },
    }
  );
}

// Update quest details (for editing)
export async function updateQuestAction(
  questId: string,
  updates: UpdateQuestInput
) {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'quest_update');

    const validatedUpdates = validateUpdateQuestInput(updates);

    // Verify quest ownership first
    await getQuestById(questId);

    const [updatedQuest] = await db
      .update(quests)
      .set({
        ...validatedUpdates,
        updatedAt: new Date(),
      })
      .where(and(eq(quests.id, questId), eq(quests.userId, userId)))
      .returning();

    if (!updatedQuest) {
      throw new AuthorizationError();
    }

    revalidatePath('/dashboard');
    return updatedQuest;
  });
}

// Complete quest with debrief data
export async function completeQuestAction(
  questId: string,
  debriefData: CompleteQuestInput
) {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'quest_complete');

    const validatedData = validateCompleteQuestInput(debriefData);

    // Verify quest ownership first
    await getQuestById(questId);

    const [completedQuest] = await db
      .update(quests)
      .set({
        status: 'COMPLETED',
        completedAt: new Date(),
        actualTime: validatedData.actualTime,
        debriefNotes: validatedData.debriefNotes,
        debriefSatisfaction: validatedData.debriefSatisfaction,
        updatedAt: new Date(),
      })
      .where(and(eq(quests.id, questId), eq(quests.userId, userId)))
      .returning();

    if (!completedQuest) {
      throw new AuthorizationError();
    }

    revalidatePath('/dashboard');
    return completedQuest;
  });
}

// Delete quest
export async function deleteQuestAction(questId: string) {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'quest_delete');

    // Validate input
    const validated = validateDeleteQuestInput({ questId });

    // Verify quest ownership first
    await getQuestById(validated.questId);

    const [deletedQuest] = await db
      .delete(quests)
      .where(and(eq(quests.id, validated.questId), eq(quests.userId, userId)))
      .returning();

    if (!deletedQuest) {
      throw new AuthorizationError();
    }

    revalidatePath('/dashboard');
    return deletedQuest;
  });
}

// Update quest status (for drag and drop operations)
export async function updateQuestStatusAction(
  questId: string,
  newStatus: QuestStatus
) {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'quest_update');

    // Validate input
    const validated = validateUpdateQuestStatusInput({ questId, newStatus });

    // Get current quest to validate transition
    const currentQuest = await getQuestById(validated.questId);

    // Validate status transitions
    const validTransitions: Record<QuestStatus, QuestStatus[]> = {
      PLANNING: ['ACTIVE', 'COMPLETED', 'ARCHIVED'],
      ACTIVE: ['PLANNING', 'COMPLETED', 'ARCHIVED'],
      COMPLETED: ['ARCHIVED'], // Completed quests can only be archived
      ARCHIVED: [], // Archived quests cannot be moved
    };

    if (!validTransitions[currentQuest.status].includes(validated.newStatus)) {
      throw new BusinessLogicError(
        `Cannot change quest status from ${currentQuest.status} to ${validated.newStatus}`
      );
    }

    // For PLANNING -> ACTIVE transition, check active quest limit
    if (
      currentQuest.status === 'PLANNING' &&
      validated.newStatus === 'ACTIVE'
    ) {
      const currentActiveCount = await getActiveQuestCount();

      // Enforce 3-quest limit (this will be handled by Emergency Deploy Protocol)
      if (currentActiveCount >= 3) {
        throw new BusinessLogicError(
          'Maximum of 3 active quests allowed. Use the activate quest action with emergency deploy.'
        );
      }
    }

    // Prepare update data based on status transition
    const updateData: {
      status: QuestStatus;
      updatedAt: Date;
      startedAt?: Date;
      completedAt?: Date;
    } = {
      status: validated.newStatus,
      updatedAt: new Date(),
    };

    // Set appropriate timestamps
    if (
      validated.newStatus === 'ACTIVE' &&
      currentQuest.status === 'PLANNING'
    ) {
      updateData.startedAt = new Date();
    } else if (validated.newStatus === 'COMPLETED') {
      updateData.completedAt = new Date();
      // If going directly from PLANNING to COMPLETED, also set startedAt
      if (currentQuest.status === 'PLANNING') {
        updateData.startedAt = new Date();
      }
    }

    // Update the quest
    const [updatedQuest] = await db
      .update(quests)
      .set(updateData)
      .where(and(eq(quests.id, validated.questId), eq(quests.userId, userId)))
      .returning();

    if (!updatedQuest) {
      throw new AuthorizationError();
    }

    revalidatePath('/dashboard');
    return updatedQuest;
  });
}

/**
 * Archive all quests belonging to a specific mission
 */
export async function archiveQuestsByMissionAction(missionId: string) {
  return safeServerAction(async () => {
    const userId = await requireAuth();
    await checkRateLimit(userId, 'bulk_operation');

    const now = new Date();

    // Archive all quests in the mission
    const archivedQuests = await db
      .update(quests)
      .set({
        status: 'ARCHIVED',
        updatedAt: now,
      })
      .where(and(eq(quests.missionId, missionId), eq(quests.userId, userId)))
      .returning();

    return archivedQuests;
  });
}
