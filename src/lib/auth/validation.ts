import { z } from 'zod';

/**
 * Input sanitization helper
 * Removes HTML/script content to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Sanitize optional string input
 */
export function sanitizeOptionalInput(
  input: string | null | undefined
): string | null {
  if (!input) return null;
  return sanitizeInput(input);
}

// Mission validation schemas
export const createMissionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  objective: z.string().max(5000, 'Objective too long').nullable().optional(),
});

export const updateMissionSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title too long')
    .optional(),
  objective: z.string().max(5000, 'Objective too long').nullable().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED'] as const).optional(),
});

export const archiveMissionSchema = z.object({
  missionId: z.string().min(1, 'Mission ID is required'),
  afterActionReport: z
    .string()
    .max(10000, 'After action report too long')
    .optional(),
});

// Quest validation schemas
export const createQuestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  description: z
    .string()
    .max(5000, 'Description too long')
    .nullable()
    .optional(),
  missionId: z.string().nullable().optional(),
  isCritical: z.boolean().optional(),
  deadline: z.date().nullable().optional(),
  estimatedTime: z.number().nullable().optional(),
});

export const updateQuestSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title too long')
    .optional(),
  description: z
    .string()
    .max(5000, 'Description too long')
    .nullable()
    .optional(),
  missionId: z.string().nullable().optional(),
  isCritical: z.boolean().optional(),
  deadline: z.date().nullable().optional(),
  estimatedTime: z.number().nullable().optional(),
});

export const completeQuestSchema = z.object({
  actualTime: z.number().optional(),
  debriefNotes: z.string().max(5000, 'Debrief notes too long').optional(),
  debriefSatisfaction: z
    .number()
    .min(1, 'Satisfaction must be 1-5')
    .max(5, 'Satisfaction must be 1-5')
    .optional(),
});

export const activateQuestSchema = z.object({
  firstTacticalStep: z
    .string()
    .max(1000, 'First tactical step too long')
    .nullable()
    .optional(),
  estimatedTime: z.number().nullable().optional(),
  isEmergencyDeploy: z.boolean().optional(),
});

// Search and filter validation
export const searchQuerySchema = z.object({
  query: z
    .string()
    .min(1, 'Search query too short')
    .max(500, 'Search query too long'),
});

export const paginationSchema = z.object({
  page: z.number().min(1, 'Page must be positive').max(10000, 'Page too large'),
  pageSize: z
    .number()
    .min(1, 'Page size must be positive')
    .max(100, 'Page size too large'),
});

// Archive filter validation
export const questArchiveFiltersSchema = z.object({
  search: z.string().max(500, 'Search too long').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  missionIds: z
    .array(z.string())
    .max(100, 'Too many mission filters')
    .optional(),
  satisfaction: z
    .array(z.number().min(1).max(5))
    .max(5, 'Too many satisfaction filters')
    .optional(),
  criticalOnly: z.boolean().optional(),
  sortBy: z
    .enum(['title', 'completedAt', 'actualTime', 'debriefSatisfaction'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const missionArchiveFiltersSchema = z.object({
  search: z.string().max(500, 'Search too long').optional(),
  archivedStartDate: z.string().optional(),
  archivedEndDate: z.string().optional(),
  sortBy: z
    .enum(['title', 'objective', 'archivedAt', 'questCount', 'avgSatisfaction'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Validate and sanitize mission creation input
 */
export function validateCreateMissionInput(input: unknown) {
  const validated = createMissionSchema.parse(input);
  return {
    title: sanitizeInput(validated.title),
    objective: sanitizeOptionalInput(validated.objective),
  };
}

/**
 * Validate and sanitize mission update input
 */
export function validateUpdateMissionInput(input: unknown) {
  const validated = updateMissionSchema.parse(input);
  return {
    ...validated,
    title: validated.title ? sanitizeInput(validated.title) : undefined,
    objective:
      validated.objective !== undefined
        ? sanitizeOptionalInput(validated.objective)
        : undefined,
  };
}

/**
 * Validate and sanitize quest creation input
 */
export function validateCreateQuestInput(input: unknown) {
  const validated = createQuestSchema.parse(input);
  return {
    ...validated,
    title: sanitizeInput(validated.title),
    description: sanitizeOptionalInput(validated.description),
  };
}

/**
 * Validate and sanitize quest update input
 */
export function validateUpdateQuestInput(input: unknown) {
  const validated = updateQuestSchema.parse(input);
  return {
    ...validated,
    title: validated.title ? sanitizeInput(validated.title) : undefined,
    description:
      validated.description !== undefined
        ? sanitizeOptionalInput(validated.description)
        : undefined,
  };
}

/**
 * Validate quest completion input
 */
export function validateCompleteQuestInput(input: unknown) {
  const validated = completeQuestSchema.parse(input);
  return {
    ...validated,
    debriefNotes: sanitizeOptionalInput(validated.debriefNotes),
  };
}

/**
 * Validate quest activation input
 */
export function validateActivateQuestInput(input: unknown) {
  const validated = activateQuestSchema.parse(input);
  return {
    ...validated,
    firstTacticalStep: sanitizeOptionalInput(validated.firstTacticalStep),
  };
}

// Delete operation validation schemas
export const deleteMissionSchema = z.object({
  missionId: z.string().min(1, 'Mission ID is required'),
  deleteQuests: z.boolean().optional(),
});

export const deleteQuestSchema = z.object({
  questId: z.string().min(1, 'Quest ID is required'),
});

export const updateQuestStatusSchema = z.object({
  questId: z.string().min(1, 'Quest ID is required'),
  newStatus: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED']),
});

export const missionIdSchema = z.object({
  missionId: z.string().min(1, 'Mission ID is required'),
});

export const questIdSchema = z.object({
  questId: z.string().min(1, 'Quest ID is required'),
});

// Feedback validation schemas
export const createFeedbackSchema = z.object({
  message: z
    .string()
    .min(1, 'Feedback message is required')
    .max(10000, 'Feedback message too long'),
});

/**
 * Validate search query
 */
export function validateSearchQuery(query: string) {
  const validated = searchQuerySchema.parse({ query });
  return sanitizeInput(validated.query);
}

/**
 * Validate mission deletion input
 */
export function validateDeleteMissionInput(input: unknown) {
  return deleteMissionSchema.parse(input);
}

/**
 * Validate quest deletion input
 */
export function validateDeleteQuestInput(input: unknown) {
  return deleteQuestSchema.parse(input);
}

/**
 * Validate quest status update input
 */
export function validateUpdateQuestStatusInput(input: unknown) {
  return updateQuestStatusSchema.parse(input);
}

/**
 * Validate mission ID input
 */
export function validateMissionId(input: unknown) {
  return missionIdSchema.parse(input);
}

/**
 * Validate quest ID input
 */
export function validateQuestId(input: unknown) {
  return questIdSchema.parse(input);
}

/**
 * Validate and sanitize feedback creation input
 */
export function validateCreateFeedbackInput(input: unknown) {
  const validated = createFeedbackSchema.parse(input);
  return {
    message: sanitizeInput(validated.message),
  };
}
