// Database-aligned types
export type MissionStatus = 'ACTIVE' | 'ARCHIVED';
export type QuestStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

// UI-specific types
export type PriorityLevel = 'critical' | 'high' | 'standard' | 'low';
export type KanbanViewType = 'mission' | 'deadline' | 'all' | 'critical';

// Database entity types (aligned with schema)
export interface Mission {
  id: string;
  userId: string;
  title: string;
  objective: string | null;
  status: MissionStatus;
  archivedAt: Date | null;
  afterActionReport: string | null;
  totalQuestCount: number;
  completedQuestCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quest {
  id: string;
  userId: string;
  missionId: string | null;
  title: string;
  description: string | null;
  isCritical: boolean | null;
  status: QuestStatus;
  deadline: Date | null;
  estimatedTime: number | null; // in minutes
  actualTime: number | null; // in minutes
  firstTacticalStep: string | null; // deployment protocol field
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  debriefNotes: string | null;
  debriefSatisfaction: number | null;
  updatedAt: Date;
}

// UI-specific types
export interface Objective {
  id: string;
  title: string;
  completed: boolean;
}

export interface Commander {
  id: string;
  username: string;
  email: string;
}

export interface SystemStats {
  activeQuests: number;
  completedThisWeek: number;
  successRateThisWeek: number;
  failedThisWeek: number;
}
