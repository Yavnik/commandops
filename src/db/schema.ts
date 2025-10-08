import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  time,
  jsonb,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified')
    .$defaultFn(() => false)
    .notNull(),
  image: text('image'),
  onboardingCompleted: boolean('onboarding_completed')
    .$defaultFn(() => false)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Command Ops Core Tables

export const missionStatusEnum = pgEnum('mission_status', [
  'ACTIVE',
  'ARCHIVED',
]);

export const missions = pgTable(
  'missions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    objective: text('objective'),
    status: missionStatusEnum('status').default('ACTIVE').notNull(),
    archivedAt: timestamp('archived_at'),
    afterActionReport: text('after_action_report'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    archivedAtIdx: index('idx_missions_archived_at').on(
      table.archivedAt.desc()
    ),
    userStatusIdx: index('idx_missions_user_status').on(
      table.userId,
      table.status
    ),
    archiveLookupIdx: index('idx_missions_archive_lookup').on(
      table.userId,
      table.status,
      table.updatedAt.desc()
    ),
    titleSearchIdx: index('idx_missions_search_title').on(
      sql`LOWER(LEFT(${table.title}, 100))`
    ),
    objectiveSearchIdx: index('idx_missions_search_objective').on(
      sql`LOWER(LEFT(${table.objective}, 100))`
    ),
  })
);

export const questStatusEnum = pgEnum('quest_status', [
  'PLANNING',
  'ACTIVE',
  'COMPLETED',
  'ARCHIVED',
]);

export const quests = pgTable(
  'quests',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    missionId: text('mission_id').references(() => missions.id, {
      onDelete: 'set null',
    }),
    title: text('title').notNull(),
    description: text('description'),
    isCritical: boolean('is_critical').$defaultFn(() => false),
    status: questStatusEnum('status').default('PLANNING').notNull(),
    deadline: timestamp('deadline'),
    estimatedTime: integer('estimated_time'), // in minutes
    actualTime: integer('actual_time'), // in minutes
    firstTacticalStep: text('first_tactical_step'), // deployment protocol field
    createdAt: timestamp('created_at').defaultNow().notNull(),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    debriefNotes: text('debrief_notes'),
    debriefSatisfaction: integer('debrief_satisfaction'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    completedAtIdx: index('idx_quests_completed_at').on(
      table.completedAt.desc()
    ),
    userMissionIdx: index('idx_quests_user_mission').on(
      table.userId,
      table.missionId
    ),
    satisfactionIdx: index('idx_quests_satisfaction').on(
      table.debriefSatisfaction
    ),
    archiveLookupIdx: index('idx_quests_archive_lookup').on(
      table.userId,
      table.status,
      table.completedAt.desc()
    ),
    titleSearchIdx: index('idx_quests_search_title').on(
      sql`LOWER(LEFT(${table.title}, 100))`
    ),
    descriptionSearchIdx: index('idx_quests_search_description').on(
      sql`LOWER(LEFT(${table.description}, 100))`
    ),
    debriefSearchIdx: index('idx_quests_search_debrief').on(
      sql`LOWER(LEFT(${table.debriefNotes}, 100))`
    ),
  })
);

export const standingOrders = pgTable('standing_orders', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  missionId: text('mission_id').references(() => missions.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  isCritical: boolean('is_critical').$defaultFn(() => false),
  recurrenceRule: jsonb('recurrence_rule').notNull(),
  generationTime: time('generation_time').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations

export const userRelations = relations(user, ({ many }) => ({
  missions: many(missions),
  quests: many(quests),
  standingOrders: many(standingOrders),
  feedback: many(feedback),
}));

export const missionRelations = relations(missions, ({ one, many }) => ({
  user: one(user, {
    fields: [missions.userId],
    references: [user.id],
  }),
  quests: many(quests),
  standingOrders: many(standingOrders),
}));

export const questRelations = relations(quests, ({ one }) => ({
  user: one(user, {
    fields: [quests.userId],
    references: [user.id],
  }),
  mission: one(missions, {
    fields: [quests.missionId],
    references: [missions.id],
  }),
}));

export const rateLimitLogs = pgTable(
  'rate_limit_logs',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    action: text('action').notNull(),
    limitValue: integer('limit_value').notNull(),
    currentCount: integer('current_count').notNull(),
    windowMs: integer('window_ms').notNull(),
    exceeded: boolean('exceeded').notNull(),
    rateLimiterEnabled: boolean('rate_limiter_enabled').notNull(),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    userActionIdx: index('idx_rate_limit_logs_user_action').on(
      table.userId,
      table.action
    ),
    createdAtIdx: index('idx_rate_limit_logs_created_at').on(
      table.createdAt.desc()
    ),
    exceededIdx: index('idx_rate_limit_logs_exceeded').on(
      table.exceeded,
      table.createdAt.desc()
    ),
  })
);

export const standingOrderRelations = relations(standingOrders, ({ one }) => ({
  user: one(user, {
    fields: [standingOrders.userId],
    references: [user.id],
  }),
  mission: one(missions, {
    fields: [standingOrders.missionId],
    references: [missions.id],
  }),
}));

export const feedback = pgTable(
  'feedback',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    message: text('message').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    userIdx: index('idx_feedback_user').on(table.userId),
    createdAtIdx: index('idx_feedback_created_at').on(table.createdAt.desc()),
  })
);

export const rateLimitLogRelations = relations(rateLimitLogs, ({ one }) => ({
  user: one(user, {
    fields: [rateLimitLogs.userId],
    references: [user.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(user, {
    fields: [feedback.userId],
    references: [user.id],
  }),
}));
