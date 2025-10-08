// Archive-specific types for the Mission Log functionality

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

export interface QuestCountRange {
  min: number;
  max: number;
}

// Quest filtering interface
export interface QuestFilters {
  searchQuery: string;
  dateRange: DateRange;
  missionIds: string[];
  satisfactionLevels: number[];
  showCriticalOnly: boolean;
}

// Mission filtering interface
export interface MissionFilters {
  searchQuery: string;
  archivedDateRange: DateRange;
}

// Pagination state
export interface PaginationState {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Sorting state
export interface SortingState {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Archive-specific quest data with computed fields
export interface ArchiveQuest {
  id: string;
  userId: string;
  missionId: string | null;
  title: string;
  description: string | null;
  isCritical: boolean | null;
  status: 'COMPLETED' | 'ARCHIVED';
  deadline: Date | null;
  estimatedTime: number | null;
  actualTime: number | null;
  completedAt: Date | null;
  debriefNotes: string | null;
  debriefSatisfaction: number | null;
  createdAt: Date;
  updatedAt: Date;
  // Computed fields
  missionTitle?: string | null;
  completionStatus: 'on_time' | 'overdue';
}

// Archive-specific mission data with statistics
export interface ArchiveMission {
  id: string;
  userId: string;
  title: string;
  objective: string | null;
  status: 'ARCHIVED';
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Computed fields
  questCount: number;
  avgSatisfaction: number | null;
}

// Extended mission details for the modal
export interface MissionDetails extends ArchiveMission {
  afterActionReport?: string | null;
  totalTime?: number;
}

// API request interfaces
export interface QuestArchiveRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  missionIds?: string[];
  satisfaction?: number[];
  criticalOnly?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MissionArchiveRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  archivedStartDate?: string;
  archivedEndDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API response interfaces
export interface ArchiveResponse<T> {
  data: T[];
  pagination: PaginationState;
}

export type QuestArchiveResponse = ArchiveResponse<ArchiveQuest>;
export type MissionArchiveResponse = ArchiveResponse<ArchiveMission>;

// Archive store state interface
export interface ArchiveState {
  // View state
  currentView: 'quests' | 'missions';

  // Quest-specific state
  questFilters: QuestFilters;
  questPagination: PaginationState;
  questSorting: SortingState;

  // Mission-specific state
  missionFilters: MissionFilters;
  missionPagination: PaginationState;
  missionSorting: SortingState;

  // UI state
  isLoading: boolean;
  error: string | null;
}

// Default values for filters and pagination
export const DEFAULT_QUEST_FILTERS: QuestFilters = {
  searchQuery: '',
  dateRange: { startDate: null, endDate: null },
  missionIds: [],
  satisfactionLevels: [],
  showCriticalOnly: false,
};

export const DEFAULT_MISSION_FILTERS: MissionFilters = {
  searchQuery: '',
  archivedDateRange: { startDate: null, endDate: null },
};

export const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  pageSize: 25,
  totalCount: 0,
  totalPages: 0,
};

export const DEFAULT_QUEST_SORTING: SortingState = {
  sortBy: 'completedAt',
  sortOrder: 'desc',
};

export const DEFAULT_MISSION_SORTING: SortingState = {
  sortBy: 'archivedAt',
  sortOrder: 'desc',
};
