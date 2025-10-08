import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { posthogCaptureException } from '@/lib/posthog-utils';
import {
  ArchiveQuest,
  ArchiveMission,
  MissionDetails,
  QuestFilters,
  MissionFilters,
  PaginationState,
  SortingState,
  DEFAULT_QUEST_FILTERS,
  DEFAULT_MISSION_FILTERS,
  DEFAULT_PAGINATION,
  DEFAULT_QUEST_SORTING,
  DEFAULT_MISSION_SORTING,
  QuestArchiveRequest,
  MissionArchiveRequest,
} from '@/types/archive';
import { showSuccessToast } from '@/lib/toast-helper';

interface ArchiveStoreState {
  // Data state
  questsData: ArchiveQuest[];
  missionsData: ArchiveMission[];

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
  isLoading: {
    quests: boolean;
    missions: boolean;
    missionDetails: boolean;
  };
  errors: {
    quests: string | null;
    missions: string | null;
    missionDetails: string | null;
  };
  selectedMissionTitle: string | null;

  // Mission modal state
  missionModalOpen: boolean;
  selectedMissionDetails: MissionDetails | null;

  // Data setters
  setQuestsData: (data: ArchiveQuest[], pagination: PaginationState) => void;
  setMissionsData: (
    data: ArchiveMission[],
    pagination: PaginationState
  ) => void;

  // View actions
  setCurrentView: (view: 'quests' | 'missions') => void;

  // Quest filter actions
  setQuestFilters: (filters: Partial<QuestFilters>) => void;
  clearQuestFilters: () => Promise<void>;
  setQuestPagination: (pagination: Partial<PaginationState>) => void;
  setQuestSorting: (sorting: Partial<SortingState>) => void;

  // Mission filter actions
  setMissionFilters: (filters: Partial<MissionFilters>) => void;
  clearMissionFilters: () => Promise<void>;
  setMissionPagination: (pagination: Partial<PaginationState>) => void;
  setMissionSorting: (sorting: Partial<SortingState>) => void;

  // Data fetching actions
  fetchQuestsData: () => Promise<void>;
  fetchMissionsData: () => Promise<void>;
  applyQuestFilters: () => Promise<void>;
  applyMissionFilters: () => Promise<void>;

  // Pagination actions
  goToQuestPage: (page: number) => Promise<void>;
  goToMissionPage: (page: number) => Promise<void>;
  changeQuestPageSize: (pageSize: number) => Promise<void>;
  changeMissionPageSize: (pageSize: number) => Promise<void>;

  // Sorting actions
  sortQuests: (sortBy: string, sortOrder?: 'asc' | 'desc') => Promise<void>;
  sortMissions: (sortBy: string, sortOrder?: 'asc' | 'desc') => Promise<void>;

  // Date preset actions
  setQuestDatePreset: (
    preset: 'last7days' | 'last30days' | 'thisyear' | 'alltime'
  ) => void;
  setMissionDatePreset: (
    preset: 'last7days' | 'last30days' | 'thisyear' | 'alltime'
  ) => void;

  // URL state sync actions
  syncFromURL: (searchParams: URLSearchParams) => void;
  getURLParams: () => URLSearchParams;

  // Error and loading actions
  setLoading: (
    key: keyof ArchiveStoreState['isLoading'],
    loading: boolean
  ) => void;
  setError: (
    key: keyof ArchiveStoreState['errors'],
    error: string | null
  ) => void;
  clearErrors: () => void;
  setSelectedMissionTitle: (title: string | null) => void;

  // Mission modal actions
  openMissionModal: (missionId: string) => Promise<void>;
  closeMissionModal: () => void;
  setMissionDetails: (details: MissionDetails | null) => void;

  // Reset actions
  resetQuestState: () => void;
  resetMissionState: () => void;
  resetAllState: () => void;
}

// Helper function to create date presets
const getDatePreset = (
  preset: 'last7days' | 'last30days' | 'thisyear' | 'alltime'
) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'last7days':
      const last7Days = new Date(today);
      last7Days.setDate(today.getDate() - 7);
      return {
        startDate: last7Days.toISOString(),
        endDate: today.toISOString(),
      };

    case 'last30days':
      const last30Days = new Date(today);
      last30Days.setDate(today.getDate() - 30);
      return {
        startDate: last30Days.toISOString(),
        endDate: today.toISOString(),
      };

    case 'thisyear':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return {
        startDate: yearStart.toISOString(),
        endDate: today.toISOString(),
      };

    case 'alltime':
    default:
      return { startDate: null, endDate: null };
  }
};

// Helper function to build quest archive request
const buildQuestRequest = (
  filters: QuestFilters,
  pagination: PaginationState,
  sorting: SortingState
): QuestArchiveRequest => ({
  page: pagination.page,
  pageSize: pagination.pageSize,
  search: filters.searchQuery || undefined,
  startDate: filters.dateRange.startDate || undefined,
  endDate: filters.dateRange.endDate || undefined,
  missionIds: filters.missionIds.length > 0 ? filters.missionIds : undefined,
  satisfaction:
    filters.satisfactionLevels.length > 0
      ? filters.satisfactionLevels
      : undefined,
  criticalOnly: filters.showCriticalOnly || undefined,
  sortBy: sorting.sortBy,
  sortOrder: sorting.sortOrder,
});

// Helper function to build mission archive request
const buildMissionRequest = (
  filters: MissionFilters,
  pagination: PaginationState,
  sorting: SortingState
): MissionArchiveRequest => ({
  page: pagination.page,
  pageSize: pagination.pageSize,
  search: filters.searchQuery || undefined,
  archivedStartDate: filters.archivedDateRange.startDate || undefined,
  archivedEndDate: filters.archivedDateRange.endDate || undefined,
  sortBy: sorting.sortBy,
  sortOrder: sorting.sortOrder,
});

export const useArchiveStore = create<ArchiveStoreState>()(
  subscribeWithSelector((set, get) => ({
    // Data state
    questsData: [],
    missionsData: [],

    // View state
    currentView: 'quests',

    // Quest-specific state
    questFilters: { ...DEFAULT_QUEST_FILTERS },
    questPagination: { ...DEFAULT_PAGINATION },
    questSorting: { ...DEFAULT_QUEST_SORTING },

    // Mission-specific state
    missionFilters: { ...DEFAULT_MISSION_FILTERS },
    missionPagination: { ...DEFAULT_PAGINATION },
    missionSorting: { ...DEFAULT_MISSION_SORTING },

    // UI state
    isLoading: {
      quests: false,
      missions: false,
      missionDetails: false,
    },
    errors: {
      quests: null,
      missions: null,
      missionDetails: null,
    },
    selectedMissionTitle: null,

    // Mission modal state
    missionModalOpen: false,
    selectedMissionDetails: null,

    // Data setters
    setQuestsData: (data, pagination) =>
      set({
        questsData: data,
        questPagination: { ...get().questPagination, ...pagination },
      }),

    setMissionsData: (data, pagination) =>
      set({
        missionsData: data,
        missionPagination: { ...get().missionPagination, ...pagination },
      }),

    // View actions
    setCurrentView: view => {
      set({ currentView: view });
      // Fetch data for the new view if it hasn't been loaded
      if (view === 'quests' && get().questsData.length === 0) {
        get().fetchQuestsData();
      } else if (view === 'missions' && get().missionsData.length === 0) {
        get().fetchMissionsData();
      }
    },

    // Quest filter actions
    setQuestFilters: filters =>
      set(state => ({
        questFilters: { ...state.questFilters, ...filters },
      })),

    clearQuestFilters: async () => {
      set({
        questFilters: { ...DEFAULT_QUEST_FILTERS },
        questPagination: { ...DEFAULT_PAGINATION },
        selectedMissionTitle: null,
      });
      // Refetch data with cleared filters
      await get().fetchQuestsData();
    },

    setQuestPagination: pagination =>
      set(state => ({
        questPagination: { ...state.questPagination, ...pagination },
      })),

    setQuestSorting: sorting =>
      set(state => ({
        questSorting: { ...state.questSorting, ...sorting },
      })),

    // Mission filter actions
    setMissionFilters: filters =>
      set(state => ({
        missionFilters: { ...state.missionFilters, ...filters },
      })),

    clearMissionFilters: async () => {
      set({
        missionFilters: { ...DEFAULT_MISSION_FILTERS },
        missionPagination: { ...DEFAULT_PAGINATION },
      });
      // Refetch data with cleared filters
      await get().fetchMissionsData();
    },

    setMissionPagination: pagination =>
      set(state => ({
        missionPagination: { ...state.missionPagination, ...pagination },
      })),

    setMissionSorting: sorting =>
      set(state => ({
        missionSorting: { ...state.missionSorting, ...sorting },
      })),

    // Data fetching actions
    fetchQuestsData: async () => {
      const state = get();

      set(state => ({
        isLoading: { ...state.isLoading, quests: true },
        errors: { ...state.errors, quests: null },
      }));

      try {
        const { getArchivedQuestsAction } = await import(
          '@/app/actions/archive'
        );
        const request = buildQuestRequest(
          state.questFilters,
          state.questPagination,
          state.questSorting
        );

        const result = await getArchivedQuestsAction(request);

        set(state => ({
          questsData: result.data,
          questPagination: { ...state.questPagination, ...result.pagination },
          isLoading: { ...state.isLoading, quests: false },
        }));
      } catch (error) {
        // Track archive quest fetch failure
        posthogCaptureException(error, {
          operation: 'fetch_archived_quests',
          error_message: error instanceof Error ? error.message : String(error),
        });

        set(state => ({
          isLoading: { ...state.isLoading, quests: false },
          errors: { ...state.errors, quests: (error as Error).message },
        }));
        throw error;
      }
    },

    fetchMissionsData: async () => {
      const state = get();

      set(state => ({
        isLoading: { ...state.isLoading, missions: true },
        errors: { ...state.errors, missions: null },
      }));

      try {
        const { getArchivedMissionsAction } = await import(
          '@/app/actions/archive'
        );
        const request = buildMissionRequest(
          state.missionFilters,
          state.missionPagination,
          state.missionSorting
        );

        const result = await getArchivedMissionsAction(request);

        set(state => ({
          missionsData: result.data,
          missionPagination: {
            ...state.missionPagination,
            ...result.pagination,
          },
          isLoading: { ...state.isLoading, missions: false },
        }));
      } catch (error) {
        // Track archive mission fetch failure
        posthogCaptureException(error, {
          operation: 'fetch_archived_missions',
          error_message: error instanceof Error ? error.message : String(error),
        });

        set(state => ({
          isLoading: { ...state.isLoading, missions: false },
          errors: { ...state.errors, missions: (error as Error).message },
        }));
        throw error;
      }
    },

    applyQuestFilters: async () => {
      // Reset pagination when applying new filters
      set(state => ({
        questPagination: { ...state.questPagination, page: 1 },
      }));

      await get().fetchQuestsData();
      showSuccessToast('Quest filters applied successfully!');
    },

    applyMissionFilters: async () => {
      // Reset pagination when applying new filters
      set(state => ({
        missionPagination: { ...state.missionPagination, page: 1 },
      }));

      await get().fetchMissionsData();
      showSuccessToast('Mission filters applied successfully!');
    },

    // Pagination actions
    goToQuestPage: async page => {
      set(state => ({
        questPagination: { ...state.questPagination, page },
      }));
      await get().fetchQuestsData();
    },

    goToMissionPage: async page => {
      set(state => ({
        missionPagination: { ...state.missionPagination, page },
      }));
      await get().fetchMissionsData();
    },

    changeQuestPageSize: async pageSize => {
      set(state => ({
        questPagination: { ...state.questPagination, pageSize, page: 1 },
      }));
      await get().fetchQuestsData();
    },

    changeMissionPageSize: async pageSize => {
      set(state => ({
        missionPagination: { ...state.missionPagination, pageSize, page: 1 },
      }));
      await get().fetchMissionsData();
    },

    // Sorting actions
    sortQuests: async (sortBy, sortOrder) => {
      const currentSorting = get().questSorting;
      const newSortOrder =
        sortOrder ||
        (currentSorting.sortBy === sortBy && currentSorting.sortOrder === 'asc'
          ? 'desc'
          : 'asc');

      set(state => ({
        questSorting: {
          ...state.questSorting,
          sortBy,
          sortOrder: newSortOrder,
        },
        questPagination: { ...state.questPagination, page: 1 },
      }));

      await get().fetchQuestsData();
    },

    sortMissions: async (sortBy, sortOrder) => {
      const currentSorting = get().missionSorting;
      const newSortOrder =
        sortOrder ||
        (currentSorting.sortBy === sortBy && currentSorting.sortOrder === 'asc'
          ? 'desc'
          : 'asc');

      set(state => ({
        missionSorting: {
          ...state.missionSorting,
          sortBy,
          sortOrder: newSortOrder,
        },
        missionPagination: { ...state.missionPagination, page: 1 },
      }));

      await get().fetchMissionsData();
    },

    // Date preset actions
    setQuestDatePreset: preset => {
      const dateRange = getDatePreset(preset);
      set(state => ({
        questFilters: { ...state.questFilters, dateRange },
      }));
    },

    setMissionDatePreset: preset => {
      const dateRange = getDatePreset(preset);
      set(state => ({
        missionFilters: {
          ...state.missionFilters,
          archivedDateRange: dateRange,
        },
      }));
    },

    // URL state sync actions
    syncFromURL: searchParams => {
      const view =
        (searchParams.get('view') as 'quests' | 'missions') || 'quests';

      if (view === 'quests') {
        const questFilters: Partial<QuestFilters> = {};
        const questPagination: Partial<PaginationState> = {};
        const questSorting: Partial<SortingState> = {};

        // Parse quest filters from URL
        if (searchParams.get('search'))
          questFilters.searchQuery = searchParams.get('search')!;
        if (searchParams.get('startDate'))
          questFilters.dateRange = {
            ...get().questFilters.dateRange,
            startDate: searchParams.get('startDate'),
          };
        if (searchParams.get('endDate'))
          questFilters.dateRange = {
            ...get().questFilters.dateRange,
            endDate: searchParams.get('endDate'),
          };
        if (searchParams.get('missions')) {
          questFilters.missionIds = searchParams.get('missions')!.split(',');
        }
        if (searchParams.get('satisfaction')) {
          questFilters.satisfactionLevels = searchParams
            .get('satisfaction')!
            .split(',')
            .map(Number);
        }
        if (searchParams.get('critical')) {
          questFilters.showCriticalOnly =
            searchParams.get('critical') === 'true';
        }

        // Parse pagination
        if (searchParams.get('page'))
          questPagination.page = Number(searchParams.get('page'));
        if (searchParams.get('pageSize'))
          questPagination.pageSize = Number(searchParams.get('pageSize'));

        // Parse sorting
        if (searchParams.get('sortBy'))
          questSorting.sortBy = searchParams.get('sortBy')!;
        if (searchParams.get('sortOrder'))
          questSorting.sortOrder = searchParams.get('sortOrder') as
            | 'asc'
            | 'desc';

        set(state => ({
          currentView: view,
          questFilters: { ...state.questFilters, ...questFilters },
          questPagination: { ...state.questPagination, ...questPagination },
          questSorting: { ...state.questSorting, ...questSorting },
        }));
      } else if (view === 'missions') {
        const missionFilters: Partial<MissionFilters> = {};
        const missionPagination: Partial<PaginationState> = {};
        const missionSorting: Partial<SortingState> = {};

        // Parse mission filters from URL
        if (searchParams.get('search'))
          missionFilters.searchQuery = searchParams.get('search')!;
        if (searchParams.get('archivedStartDate'))
          missionFilters.archivedDateRange = {
            ...get().missionFilters.archivedDateRange,
            startDate: searchParams.get('archivedStartDate'),
          };
        if (searchParams.get('archivedEndDate'))
          missionFilters.archivedDateRange = {
            ...get().missionFilters.archivedDateRange,
            endDate: searchParams.get('archivedEndDate'),
          };

        // Parse pagination
        if (searchParams.get('page'))
          missionPagination.page = Number(searchParams.get('page'));
        if (searchParams.get('pageSize'))
          missionPagination.pageSize = Number(searchParams.get('pageSize'));

        // Parse sorting
        if (searchParams.get('sortBy'))
          missionSorting.sortBy = searchParams.get('sortBy')!;
        if (searchParams.get('sortOrder'))
          missionSorting.sortOrder = searchParams.get('sortOrder') as
            | 'asc'
            | 'desc';

        set(state => ({
          currentView: view,
          missionFilters: { ...state.missionFilters, ...missionFilters },
          missionPagination: {
            ...state.missionPagination,
            ...missionPagination,
          },
          missionSorting: { ...state.missionSorting, ...missionSorting },
        }));
      }
    },

    getURLParams: () => {
      const state = get();
      const params = new URLSearchParams();

      params.set('view', state.currentView);

      if (state.currentView === 'quests') {
        const { questFilters, questPagination, questSorting } = state;

        if (questFilters.searchQuery)
          params.set('search', questFilters.searchQuery);
        if (questFilters.dateRange.startDate)
          params.set('startDate', questFilters.dateRange.startDate);
        if (questFilters.dateRange.endDate)
          params.set('endDate', questFilters.dateRange.endDate);
        if (questFilters.missionIds.length > 0)
          params.set('missions', questFilters.missionIds.join(','));
        if (questFilters.satisfactionLevels.length > 0)
          params.set('satisfaction', questFilters.satisfactionLevels.join(','));
        if (questFilters.showCriticalOnly) params.set('critical', 'true');

        if (questPagination.page > 1)
          params.set('page', questPagination.page.toString());
        if (questPagination.pageSize !== 25)
          params.set('pageSize', questPagination.pageSize.toString());

        if (questSorting.sortBy !== 'completedAt')
          params.set('sortBy', questSorting.sortBy);
        if (questSorting.sortOrder !== 'desc')
          params.set('sortOrder', questSorting.sortOrder);
      } else if (state.currentView === 'missions') {
        const { missionFilters, missionPagination, missionSorting } = state;

        if (missionFilters.searchQuery)
          params.set('search', missionFilters.searchQuery);
        if (missionFilters.archivedDateRange.startDate)
          params.set(
            'archivedStartDate',
            missionFilters.archivedDateRange.startDate
          );
        if (missionFilters.archivedDateRange.endDate)
          params.set(
            'archivedEndDate',
            missionFilters.archivedDateRange.endDate
          );

        if (missionPagination.page > 1)
          params.set('page', missionPagination.page.toString());
        if (missionPagination.pageSize !== 25)
          params.set('pageSize', missionPagination.pageSize.toString());

        if (missionSorting.sortBy !== 'archivedAt')
          params.set('sortBy', missionSorting.sortBy);
        if (missionSorting.sortOrder !== 'desc')
          params.set('sortOrder', missionSorting.sortOrder);
      }

      return params;
    },

    // Error and loading actions
    setLoading: (key, loading) =>
      set(state => ({
        isLoading: { ...state.isLoading, [key]: loading },
      })),

    setError: (key, error) =>
      set(state => ({
        errors: { ...state.errors, [key]: error },
      })),

    clearErrors: () =>
      set({
        errors: {
          quests: null,
          missions: null,
          missionDetails: null,
        },
      }),

    setSelectedMissionTitle: title => set({ selectedMissionTitle: title }),

    // Mission modal actions
    openMissionModal: async (missionId: string) => {
      set(state => ({
        isLoading: { ...state.isLoading, missionDetails: true },
        errors: { ...state.errors, missionDetails: null },
        missionModalOpen: true,
      }));

      try {
        const { getMissionDetailsAction } = await import(
          '@/app/actions/archive'
        );
        const missionDetails = await getMissionDetailsAction(missionId);

        set(state => ({
          selectedMissionDetails: missionDetails,
          isLoading: { ...state.isLoading, missionDetails: false },
        }));
      } catch (error) {
        // Track mission details fetch failure
        posthogCaptureException(error, {
          operation: 'fetch_mission_details',
          mission_id: missionId,
          error_message: error instanceof Error ? error.message : String(error),
        });

        set(state => ({
          isLoading: { ...state.isLoading, missionDetails: false },
          errors: { ...state.errors, missionDetails: (error as Error).message },
          missionModalOpen: false,
        }));
        throw error;
      }
    },

    closeMissionModal: () =>
      set({
        missionModalOpen: false,
        selectedMissionDetails: null,
      }),

    setMissionDetails: (details: MissionDetails | null) =>
      set({ selectedMissionDetails: details }),

    // Reset actions
    resetQuestState: () =>
      set({
        questFilters: { ...DEFAULT_QUEST_FILTERS },
        questPagination: { ...DEFAULT_PAGINATION },
        questSorting: { ...DEFAULT_QUEST_SORTING },
        questsData: [],
      }),

    resetMissionState: () =>
      set({
        missionFilters: { ...DEFAULT_MISSION_FILTERS },
        missionPagination: { ...DEFAULT_PAGINATION },
        missionSorting: { ...DEFAULT_MISSION_SORTING },
        missionsData: [],
      }),

    resetAllState: () => {
      get().resetQuestState();
      get().resetMissionState();
      set({
        currentView: 'quests',
        isLoading: {
          quests: false,
          missions: false,
          missionDetails: false,
        },
        errors: {
          quests: null,
          missions: null,
          missionDetails: null,
        },
        missionModalOpen: false,
        selectedMissionDetails: null,
      });
    },
  }))
);
