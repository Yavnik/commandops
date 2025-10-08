import { create } from 'zustand';
import {
  Quest,
  Mission,
  Commander,
  KanbanViewType,
  QuestStatus,
  MissionStatus,
} from '@/types';
import { nanoid } from 'nanoid';
import { showSuccessToast } from '@/lib/toast-helper';
import { sortQuestsByPriority } from '@/lib/quest-priority';
import { posthogCapture, posthogCaptureException } from '@/lib/posthog-utils';

interface CommandOpsState {
  // Client-only state
  commander: Commander;
  missions: Mission[];
  quests: Quest[];

  // UI state
  kanbanView: KanbanViewType;
  sidebarOpen: boolean;

  // Error state
  isLoading: {
    commander: boolean;
    quests: boolean;
    missions: boolean;
  };
  errors: {
    commander: string | null;
    quests: string | null;
    missions: string | null;
  };

  // Data setters (for server data)
  setCommander: (commander: Commander) => void;
  setMissions: (missions: Mission[]) => void;
  setQuests: (quests: Quest[]) => void;

  // Client actions (optimistic updates)
  addQuest: (quest: {
    title: string;
    description: string | null;
    missionId: string | null;
    isCritical: boolean;
    deadline: Date | null;
  }) => Promise<void>;
  updateQuest: (
    id: string,
    questData: {
      title: string;
      description: string | null;
      missionId: string | null;
      isCritical: boolean;
      deadline: Date | null;
      estimatedTime: number | null;
    }
  ) => Promise<void>;
  updateQuestStatus: (id: string, status: QuestStatus) => Promise<void>;
  deployQuest: (
    id: string,
    deploymentData: {
      estimatedTime: number | null;
      firstAction: string;
    }
  ) => Promise<void>;
  completeQuest: (
    id: string,
    debriefData: {
      actualTime: number;
      debriefNotes: string;
      debriefSatisfaction: number | null;
    }
  ) => Promise<void>;
  deleteQuest: (id: string) => Promise<void>;
  addMission: (mission: {
    title: string;
    objective: string | null;
    status: MissionStatus;
  }) => Promise<void>;
  updateMission: (
    id: string,
    missionData: {
      title: string;
      objective: string | null;
    }
  ) => Promise<void>;
  deleteMission: (id: string, deleteQuests: boolean) => Promise<void>;
  archiveMission: (id: string, afterActionReport?: string) => Promise<void>;
  fetchMissions: () => Promise<void>;
  fetchCommander: () => Promise<void>;

  // UI actions
  setKanbanView: (view: KanbanViewType) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Error actions
  setLoading: (
    key: keyof CommandOpsState['isLoading'],
    loading: boolean
  ) => void;
  setError: (
    key: keyof CommandOpsState['errors'],
    error: string | null
  ) => void;
  clearErrors: () => void;
}

// Default commander state
const defaultCommander: Commander = {
  id: '',
  username: 'Commander',
  email: '',
};

export const useCommandOpsStore = create<CommandOpsState>()((set, get) => ({
  // Client-only state
  commander: { ...defaultCommander },
  missions: [],
  quests: [],

  // UI state
  kanbanView: 'all',
  sidebarOpen: false,

  // Error state
  isLoading: {
    commander: false,
    quests: false,
    missions: false,
  },
  errors: {
    commander: null,
    quests: null,
    missions: null,
  },

  // Data setters (for server data) with validation
  setCommander: commander => {
    // Validate commander object structure
    const validCommander =
      commander && typeof commander === 'object' ? commander : defaultCommander;
    set({ commander: validCommander });
  },
  setMissions: missions => {
    // Ensure missions is always an array
    const validMissions = Array.isArray(missions) ? missions : [];
    set({ missions: validMissions });
  },
  setQuests: quests => {
    // Ensure quests is always an array
    const validQuests = Array.isArray(quests) ? quests : [];
    set({ quests: sortQuestsByPriority(validQuests) });
  },

  // Client actions (optimistic updates) - will be refactored
  addQuest: async questData => {
    // Validate required fields
    if (!questData.title?.trim()) {
      throw new Error('Quest title is required');
    }

    const tempId = nanoid();
    const optimisticQuest: Quest = {
      id: tempId,
      userId: get().commander.id,
      title: questData.title,
      description: questData.description,
      missionId: questData.missionId,
      isCritical: questData.isCritical,
      deadline: questData.deadline,
      estimatedTime: null,
      actualTime: null,
      firstTacticalStep: null,
      status: 'PLANNING',
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      debriefNotes: null,
      debriefSatisfaction: null,
      updatedAt: new Date(),
    };

    // Set loading state
    set(state => ({
      isLoading: { ...state.isLoading, quests: true },
      errors: { ...state.errors, quests: null },
    }));

    // 1. Optimistic update
    set(state => ({
      quests: sortQuestsByPriority([...state.quests, optimisticQuest]),
      // Update mission quest count if quest is assigned to a mission
      missions: questData.missionId
        ? (state.missions || []).map(m =>
            m && m.id === questData.missionId
              ? { ...m, totalQuestCount: Number(m.totalQuestCount || 0) + 1 }
              : m
          )
        : state.missions,
    }));

    try {
      // 2. Server sync with chunk loading error recovery
      const { createQuestAction } = await import('@/app/actions/quests');

      const serverQuest = await createQuestAction({
        title: questData.title,
        description: questData.description || undefined,
        missionId: questData.missionId || undefined,
        isCritical: questData.isCritical || undefined,
        deadline: questData.deadline || undefined,
        estimatedTime: undefined,
      });

      // 3. Replace optimistic with server data
      set(state => ({
        quests: sortQuestsByPriority(
          (state.quests || []).map(q =>
            q && q.id === tempId ? serverQuest : q
          )
        ),
        isLoading: { ...state.isLoading, quests: false },
      }));

      // Track successful quest creation (with safety check)
      posthogCapture('quest_created', {
        quest_id: serverQuest?.id || 'unknown_id',
        has_mission: !!questData.missionId,
        is_critical: questData.isCritical,
        has_deadline: !!questData.deadline,
        has_description: !!questData.description,
        server_quest_valid: !!(serverQuest && serverQuest.id),
      });

      // Show success toast
      showSuccessToast('Quest created successfully!');
    } catch (error) {
      // Track quest creation failure
      posthogCapture('quest_creation_failed', {
        error: error instanceof Error ? error.message : String(error),
        has_mission: !!questData.missionId,
        is_critical: questData.isCritical,
        error_type: error instanceof Error ? error.constructor.name : 'unknown',
      });

      // 4. Revert on failure
      set(state => ({
        quests: (state.quests || []).filter(q => q && q.id !== tempId),
        // Revert mission quest count if quest was assigned to a mission
        missions: questData.missionId
          ? (state.missions || []).map(m =>
              m && m.id === questData.missionId
                ? {
                    ...m,
                    totalQuestCount: Number(m.totalQuestCount || 0) - 1,
                  }
                : m
            )
          : state.missions,
        isLoading: { ...state.isLoading, quests: false },
        errors: { ...state.errors, quests: (error as Error).message },
      }));

      throw error;
    }
  },

  updateQuest: async (id, questData) => {
    const originalQuests = get().quests;
    const originalMissions = get().missions;
    const quest = (get().quests || []).find(q => q.id === id);

    // Validate quest exists
    if (!quest) {
      throw new Error('Quest not found');
    }

    // Validate required fields
    if (!questData.title?.trim()) {
      throw new Error('Quest title is required');
    }

    // Create updated quest
    const updatedQuest: Quest = {
      ...quest,
      title: questData.title,
      description: questData.description,
      missionId: questData.missionId,
      isCritical: questData.isCritical,
      deadline: questData.deadline,
      estimatedTime: questData.estimatedTime,
      updatedAt: new Date(),
    };

    // Set loading state
    set(state => ({
      isLoading: { ...state.isLoading, quests: true },
      errors: { ...state.errors, quests: null },
    }));

    // 1. Optimistic update
    set(state => {
      const updatedQuests = sortQuestsByPriority(
        (state.quests || []).map(q => (q && q.id === id ? updatedQuest : q))
      );

      // Update mission counts if quest is moved between missions
      let updatedMissions = state.missions;

      // If mission assignment changed
      if (quest.missionId !== questData.missionId) {
        updatedMissions = (state.missions || []).map(mission => {
          if (!mission || !mission.id) return mission;
          // Remove from old mission
          if (mission.id === quest.missionId) {
            return {
              ...mission,
              totalQuestCount: Number(mission.totalQuestCount || 0) - 1,
              completedQuestCount:
                quest.status === 'COMPLETED'
                  ? Number(mission.completedQuestCount || 0) - 1
                  : Number(mission.completedQuestCount || 0),
            };
          }
          // Add to new mission
          if (mission.id === questData.missionId) {
            return {
              ...mission,
              totalQuestCount: Number(mission.totalQuestCount || 0) + 1,
              completedQuestCount:
                quest.status === 'COMPLETED'
                  ? Number(mission.completedQuestCount || 0) + 1
                  : Number(mission.completedQuestCount || 0),
            };
          }
          return mission;
        });
      }

      return {
        quests: updatedQuests,
        missions: updatedMissions,
      };
    });

    try {
      // 2. Server sync
      const { updateQuestAction } = await import('@/app/actions/quests');
      const serverQuest = await updateQuestAction(id, {
        title: questData.title,
        description: questData.description,
        missionId: questData.missionId,
        isCritical: questData.isCritical,
        deadline: questData.deadline,
        estimatedTime: questData.estimatedTime,
      });

      // 3. Replace optimistic with server data
      set(state => ({
        quests: sortQuestsByPriority(
          (state.quests || []).map(q => (q && q.id === id ? serverQuest : q))
        ),
        isLoading: { ...state.isLoading, quests: false },
      }));

      // Show success toast
      showSuccessToast('Quest updated successfully!');
    } catch (error) {
      // Track quest update failure
      posthogCaptureException(error, {
        operation: 'quest_update',
        quest_id: id,
        error_message: error instanceof Error ? error.message : String(error),
      });

      // 4. Revert on failure
      set(state => ({
        quests: originalQuests,
        missions: originalMissions,
        isLoading: { ...state.isLoading, quests: false },
        errors: { ...state.errors, quests: (error as Error).message },
      }));

      throw error;
    }
  },

  updateQuestStatus: async (id, status) => {
    const originalQuests = get().quests;
    const originalMissions = get().missions;
    const quest = (get().quests || []).find(q => q.id === id);

    // Validate quest exists
    if (!quest) {
      throw new Error(`Quest with id ${id} not found`);
    }

    // Set loading state
    set(state => ({
      isLoading: { ...state.isLoading, quests: true },
      errors: { ...state.errors, quests: null },
    }));

    // 1. Optimistic update
    set(state => {
      const updatedQuests = sortQuestsByPriority(
        (state.quests || []).map(questItem =>
          questItem && questItem.id === id
            ? {
                ...questItem,
                status,
                completedAt:
                  status === 'COMPLETED' ? new Date() : questItem.completedAt,
                startedAt:
                  status === 'ACTIVE' && questItem.status === 'PLANNING'
                    ? new Date()
                    : questItem.startedAt,
                updatedAt: new Date(),
              }
            : questItem
        )
      );

      // Update mission completedQuestCount if quest belongs to a mission
      const updatedMissions = quest.missionId
        ? (state.missions || []).map(mission => {
            if (!mission || !mission.id) return mission;
            if (mission.id === quest.missionId) {
              let completedQuestCount = Number(
                mission.completedQuestCount || 0
              );

              // If changing from non-completed to completed, increment
              if (status === 'COMPLETED' && quest.status !== 'COMPLETED') {
                completedQuestCount = completedQuestCount + 1;
              }
              // If changing from completed to non-completed, decrement
              else if (status !== 'COMPLETED' && quest.status === 'COMPLETED') {
                completedQuestCount = completedQuestCount - 1;
              }

              return { ...mission, completedQuestCount };
            }
            return mission;
          })
        : state.missions;

      return {
        quests: updatedQuests,
        missions: updatedMissions,
      };
    });

    try {
      // 2. Server sync - Use the new comprehensive status update action
      const { updateQuestStatusAction } = await import('@/app/actions/quests');

      await updateQuestStatusAction(id, status);

      // 3. Success handling
      set(state => ({
        isLoading: { ...state.isLoading, quests: false },
      }));

      // Track quest status change
      posthogCapture('quest_status_changed', {
        quest_id: id,
        previous_status: quest?.status,
        new_status: status,
        has_mission: !!quest?.missionId,
        is_critical: !!quest?.isCritical,
      });

      // Show appropriate success message
      if (status === 'ACTIVE') {
        showSuccessToast('Quest activated!');
      } else if (status === 'COMPLETED') {
        showSuccessToast('Quest completed! Great work!');
      } else if (status === 'PLANNING') {
        showSuccessToast('Quest moved to planning!');
      }
    } catch (error) {
      // 3. Revert on failure
      set({
        quests: originalQuests,
        missions: originalMissions,
        isLoading: { ...get().isLoading, quests: false },
        errors: { ...get().errors, quests: (error as Error).message },
      });

      throw error;
    }
  },

  deployQuest: async (id, deploymentData) => {
    const originalQuests = get().quests;
    const quest = (get().quests || []).find(q => q.id === id);

    // Validate quest exists and is in PLANNING state
    if (!quest) {
      throw new Error(`Quest with id ${id} not found`);
    }

    if (quest.status !== 'PLANNING') {
      throw new Error('Quest can only be deployed from PLANNING status');
    }

    // No need to modify description - firstTacticalStep is stored separately

    // 1. Optimistic update - update quest with deployment data and set to ACTIVE
    set(state => ({
      quests: sortQuestsByPriority(
        (state.quests || []).map(q =>
          q && q.id === id
            ? {
                ...q,
                status: 'ACTIVE' as QuestStatus,
                estimatedTime: deploymentData.estimatedTime,
                firstTacticalStep: deploymentData.firstAction.trim() || null,
                startedAt: new Date(),
                updatedAt: new Date(),
              }
            : q
        )
      ),
    }));

    try {
      // 2. Server sync
      const { activateQuestAction } = await import('@/app/actions/quests');

      await activateQuestAction(id, {
        estimatedTime: deploymentData.estimatedTime || undefined,
        firstTacticalStep: deploymentData.firstAction || undefined,
      });

      showSuccessToast('Quest deployed successfully!');
    } catch (error) {
      // 3. Revert on failure
      set({ quests: originalQuests });

      throw error;
    }
  },

  completeQuest: async (id, debriefData) => {
    const originalQuests = get().quests;
    const originalMissions = get().missions;
    const quest = (get().quests || []).find(q => q.id === id);

    // Validate quest exists and is in ACTIVE state
    if (!quest) {
      throw new Error(`Quest with id ${id} not found`);
    }

    if (quest.status !== 'ACTIVE' && quest.status !== 'PLANNING') {
      throw new Error(
        'Quest can only be completed from ACTIVE or PLANNING status'
      );
    }

    // 1. Optimistic update - update quest with debrief data and set to COMPLETED
    set(state => ({
      quests: sortQuestsByPriority(
        (state.quests || []).map(q =>
          q && q.id === id
            ? {
                ...q,
                status: 'COMPLETED' as QuestStatus,
                actualTime: debriefData.actualTime,
                debriefNotes: debriefData.debriefNotes?.trim() || null,
                debriefSatisfaction: debriefData.debriefSatisfaction,
                startedAt:
                  quest.status === 'PLANNING' ? new Date() : q.startedAt,
                completedAt: new Date(),
                updatedAt: new Date(),
              }
            : q
        )
      ),
      // Update mission completedQuestCount if quest belongs to a mission
      missions: quest.missionId
        ? (state.missions || []).map(mission => {
            if (mission.id === quest.missionId) {
              return {
                ...mission,
                completedQuestCount: Number(mission.completedQuestCount) + 1,
              };
            }
            return mission;
          })
        : state.missions,
    }));

    try {
      // 2. Server sync
      const { completeQuestAction } = await import('@/app/actions/quests');

      await completeQuestAction(id, {
        actualTime: debriefData.actualTime,
        debriefNotes: debriefData.debriefNotes || undefined,
        debriefSatisfaction: debriefData.debriefSatisfaction || undefined,
      });

      // Track quest completion
      posthogCapture('quest_completed', {
        quest_id: id,
        previous_status: quest?.status,
        direct_completion: quest?.status === 'PLANNING',
        actual_time_minutes: debriefData.actualTime,
        estimated_time_minutes: quest?.estimatedTime,
        time_variance: quest?.estimatedTime
          ? debriefData.actualTime - quest.estimatedTime
          : null,
        satisfaction_rating: debriefData.debriefSatisfaction,
        has_debrief_notes: !!debriefData.debriefNotes,
        has_mission: !!quest?.missionId,
        is_critical: !!quest?.isCritical,
      });

      showSuccessToast('Mission completed successfully!');
    } catch (error) {
      // Track quest completion failure
      posthogCaptureException(error, {
        operation: 'quest_complete',
        quest_id: id,
        error_message: error instanceof Error ? error.message : String(error),
      });

      // 3. Revert on failure
      set({ quests: originalQuests, missions: originalMissions });

      throw error;
    }
  },

  addMission: async missionData => {
    // Validate required fields
    if (!missionData.title?.trim()) {
      throw new Error('Mission title is required');
    }

    const tempId = nanoid();
    const optimisticMission: Mission = {
      id: tempId,
      userId: get().commander.id,
      title: missionData.title,
      objective: missionData.objective,
      status: missionData.status,
      archivedAt: null,
      afterActionReport: null,
      totalQuestCount: 0,
      completedQuestCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 1. Optimistic update
    set(state => ({ missions: [...state.missions, optimisticMission] }));

    try {
      // 2. Server sync
      const { createMissionAction } = await import('@/app/actions/missions');
      const serverMission = await createMissionAction({
        title: missionData.title,
        objective: missionData.objective || undefined,
      });

      // 3. Replace optimistic with server data
      set(state => ({
        missions: (state.missions || []).map(m =>
          m && m.id === tempId ? serverMission : m
        ),
      }));

      // Track mission creation
      posthogCapture('mission_created', {
        mission_id: serverMission.id,
        has_objective: !!missionData.objective,
        status: missionData.status,
      });

      // Show success toast
      showSuccessToast('Mission created successfully!');
    } catch (error) {
      // 4. Revert on failure
      set(state => ({
        missions: (state.missions || []).filter(m => m && m.id !== tempId),
      }));

      throw error;
    }
  },

  updateMission: async (id, missionData) => {
    const originalMissions = get().missions;
    const mission = (get().missions || []).find(m => m.id === id);

    // Validate mission exists
    if (!mission) {
      throw new Error('Mission not found');
    }

    // Validate required fields
    if (!missionData.title?.trim()) {
      throw new Error('Mission title is required');
    }

    // Create updated mission
    const updatedMission: Mission = {
      ...mission,
      title: missionData.title,
      objective: missionData.objective,
      updatedAt: new Date(),
    };

    // Set loading state
    set(state => ({
      isLoading: { ...state.isLoading, missions: true },
      errors: { ...state.errors, missions: null },
    }));

    // 1. Optimistic update
    set(state => ({
      missions: (state.missions || []).map(m =>
        m.id === id ? updatedMission : m
      ),
    }));

    try {
      // 2. Server sync
      const { updateMissionAction } = await import('@/app/actions/missions');
      const serverMission = await updateMissionAction(id, {
        title: missionData.title,
        objective: missionData.objective,
      });

      // 3. Replace optimistic with server data
      set(state => ({
        missions: (state.missions || []).map(m =>
          m.id === id ? serverMission : m
        ),
        isLoading: { ...state.isLoading, missions: false },
      }));

      // Show success toast
      showSuccessToast('Mission updated successfully!');
    } catch (error) {
      // Track mission update failure
      posthogCaptureException(error, {
        operation: 'mission_update',
        mission_id: id,
        error_message: error instanceof Error ? error.message : String(error),
      });

      // 4. Revert on failure
      set(state => ({
        missions: originalMissions,
        isLoading: { ...state.isLoading, missions: false },
        errors: { ...state.errors, missions: (error as Error).message },
      }));

      throw error;
    }
  },

  deleteMission: async (id, deleteQuests) => {
    const originalMissions = get().missions;
    const originalQuests = get().quests;
    const mission = (get().missions || []).find(m => m.id === id);

    // Validate mission exists
    if (!mission) {
      throw new Error('Mission not found');
    }

    // Set loading state
    set(state => ({
      isLoading: { ...state.isLoading, missions: true },
      errors: { ...state.errors, missions: null },
    }));

    // 1. Optimistic update
    set(state => ({
      missions: (state.missions || []).filter(m => m && m.id !== id),
      quests: deleteQuests
        ? (state.quests || []).filter(q => q.missionId !== id)
        : (state.quests || []).map(q =>
            q.missionId === id ? { ...q, missionId: null } : q
          ),
    }));

    try {
      // 2. Server sync
      const { deleteMissionAction } = await import('@/app/actions/missions');
      await deleteMissionAction(id, deleteQuests);

      // 3. Success handling
      set(state => ({
        isLoading: { ...state.isLoading, missions: false },
      }));

      // Show success toast
      showSuccessToast('Mission deleted successfully!');
    } catch (error) {
      // Track mission deletion failure
      posthogCaptureException(error, {
        operation: 'mission_delete',
        mission_id: id,
        delete_quests: deleteQuests,
        error_message: error instanceof Error ? error.message : String(error),
      });

      // 4. Revert on failure
      set({
        missions: originalMissions,
        quests: originalQuests,
        isLoading: { ...get().isLoading, missions: false },
        errors: { ...get().errors, missions: (error as Error).message },
      });

      throw error;
    }
  },

  archiveMission: async (id, afterActionReport) => {
    const originalMissions = get().missions;
    const originalQuests = get().quests;
    const mission = (get().missions || []).find(m => m.id === id);

    // Validate mission exists
    if (!mission) {
      throw new Error('Mission not found');
    }

    // Check if all quests are completed
    const pendingQuests = mission.totalQuestCount - mission.completedQuestCount;
    if (pendingQuests > 0) {
      throw new Error(
        `Cannot archive mission: ${pendingQuests} quest${pendingQuests !== 1 ? 's' : ''} still pending`
      );
    }

    // Set loading state
    set(state => ({
      isLoading: { ...state.isLoading, missions: true },
      errors: { ...state.errors, missions: null },
    }));

    // 1. Optimistic update - remove mission and archive related quests
    set(state => ({
      missions: (state.missions || []).filter(m => m && m.id !== id),
      quests: (state.quests || []).map(q =>
        q.missionId === id
          ? { ...q, status: 'ARCHIVED', updatedAt: new Date() }
          : q
      ),
    }));

    try {
      // 2. Server sync
      const { archiveMissionAction } = await import('@/app/actions/missions');
      await archiveMissionAction(id, afterActionReport);

      // 3. Success handling
      set(state => ({
        isLoading: { ...state.isLoading, missions: false },
      }));

      // Show success toast
      showSuccessToast('Mission archived successfully!');
    } catch (error) {
      // Track mission archive failure
      posthogCaptureException(error, {
        operation: 'mission_archive',
        mission_id: id,
        has_after_action_report: !!afterActionReport,
        error_message: error instanceof Error ? error.message : String(error),
      });

      // 4. Revert on failure
      set({
        missions: originalMissions,
        quests: originalQuests,
        isLoading: { ...get().isLoading, missions: false },
        errors: { ...get().errors, missions: (error as Error).message },
      });

      throw error;
    }
  },

  fetchMissions: async () => {
    set(state => ({
      isLoading: { ...state.isLoading, missions: true },
      errors: { ...state.errors, missions: null },
    }));

    try {
      const { getActiveMissions } = await import('@/lib/queries/missions');
      const missions = await getActiveMissions();
      set({
        missions,
        isLoading: { ...get().isLoading, missions: false },
      });
    } catch (error) {
      // Track mission fetch failure
      posthogCaptureException(error, {
        operation: 'fetch_missions',
        error_message: error instanceof Error ? error.message : String(error),
      });

      set({
        isLoading: { ...get().isLoading, missions: false },
        errors: { ...get().errors, missions: (error as Error).message },
      });
    }
  },

  fetchCommander: async () => {
    set(state => ({
      isLoading: { ...state.isLoading, commander: true },
      errors: { ...state.errors, commander: null },
    }));

    try {
      const { getCommanderData } = await import('@/lib/queries/commander');
      const commanderData = await getCommanderData();
      if (!commanderData) {
        throw new Error('Commander data not found');
      }
      const commander = {
        id: commanderData.id,
        username: commanderData.username,
        email: commanderData.email,
      };
      set({
        commander,
        isLoading: { ...get().isLoading, commander: false },
      });
    } catch (error) {
      // Track commander fetch failure
      posthogCaptureException(error, {
        operation: 'fetch_commander',
        error_message: error instanceof Error ? error.message : String(error),
      });

      set({
        isLoading: { ...get().isLoading, commander: false },
        errors: { ...get().errors, commander: (error as Error).message },
      });
    }
  },

  deleteQuest: async id => {
    const originalQuests = get().quests;
    const originalMissions = get().missions;
    const quest = (get().quests || []).find(q => q.id === id);

    // Validate quest exists
    if (!quest) {
      throw new Error(`Quest with id ${id} not found`);
    }

    // 1. Optimistic update - remove quest from local state and update mission counts
    set(state => ({
      quests: (state.quests || []).filter(q => q && q.id !== id),
      // Update mission quest counts if quest belongs to a mission
      missions: quest.missionId
        ? (state.missions || []).map(mission => {
            if (mission.id === quest.missionId) {
              return {
                ...mission,
                totalQuestCount: Number(mission.totalQuestCount) - 1,
                completedQuestCount:
                  quest.status === 'COMPLETED'
                    ? Number(mission.completedQuestCount) - 1
                    : Number(mission.completedQuestCount),
              };
            }
            return mission;
          })
        : state.missions,
    }));

    try {
      // 2. Server sync
      const { deleteQuestAction } = await import('@/app/actions/quests');
      await deleteQuestAction(id);

      // Show success toast
      showSuccessToast('Quest deleted successfully!');
    } catch (error) {
      // Track quest deletion failure
      posthogCaptureException(error, {
        operation: 'quest_delete',
        quest_id: id,
        error_message: error instanceof Error ? error.message : String(error),
      });

      // 3. Revert on failure
      set({ quests: originalQuests, missions: originalMissions });

      throw error;
    }
  },

  // UI actions
  setKanbanView: view => {
    const currentView = get().kanbanView;
    posthogCapture('kanban_view_changed', {
      previous_view: currentView,
      new_view: view,
    });
    set({ kanbanView: view });
  },
  setSidebarOpen: open => set({ sidebarOpen: open }),
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),

  // Error actions
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
        commander: null,
        quests: null,
        missions: null,
      },
    }),
}));
