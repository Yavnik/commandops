'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCommandOpsStore } from '@/store/command-ops-store';
import { MissionCard } from '@/components/mission-card';
import { NewMissionDialog } from '@/components/new-mission-dialog';
import { EditMissionDialog } from '@/components/edit-mission-dialog';
import { ArchiveMissionDialog } from '@/components/archive-mission-dialog';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Mission } from '@/types';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';
import { DataErrorBoundary } from '@/components/error-boundary-enhanced';

export function MissionView() {
  const [newMissionOpen, setNewMissionOpen] = useState(false);
  const [editMissionOpen, setEditMissionOpen] = useState(false);
  const [archiveMissionOpen, setArchiveMissionOpen] = useState(false);
  const [missionToEdit, setMissionToEdit] = useState<Mission | null>(null);
  const [missionToArchive, setMissionToArchive] = useState<Mission | null>(
    null
  );
  const [missionToDelete, setMissionToDelete] = useState<Mission | null>(null);
  const [deleteQuests, setDeleteQuests] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const { missions, deleteMission } = useCommandOpsStore();

  const handleDeleteMission = async () => {
    if (!missionToDelete) return;

    setIsDeleting(true);
    try {
      await deleteMission(missionToDelete.id, deleteQuests);

      setMissionToDelete(null);
      setDeleteQuests(false);
    } catch (error) {
      console.error('Failed to delete mission:', error);
      showEnhancedErrorToast(error, {
        context: 'Mission Deletion',
        onRetry: () => handleDeleteMission(),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Get quest count for current mission to delete - using direct count for optimal performance
  const questCount = missionToDelete ? missionToDelete.totalQuestCount : 0;

  const handleViewQuests = (missionId: string) => {
    router.push(`/dashboard?filter=mission&mission-id=${missionId}`);
  };

  const handleEditMission = (mission: Mission) => {
    setMissionToEdit(mission);
    setEditMissionOpen(true);
  };

  const handleArchiveMission = (mission: Mission) => {
    setMissionToArchive(mission);
    setArchiveMissionOpen(true);
  };

  return (
    <DataErrorBoundary context="mission management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary-text">
              Mission Control
            </h1>
            <p className="text-secondary-text mt-1">
              Manage your strategic objectives and track progress
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* New Mission Button */}
            <Button
              onClick={() => setNewMissionOpen(true)}
              className="bg-primary/80 hover:bg-primary/90 border border-accent-text/50 text-accent-text font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-accent-text/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Initialize Mission
            </Button>
          </div>
        </div>

        {/* Missions Grid/List */}
        {(missions || []).length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <Plus className="h-8 w-8 text-secondary-text" />
              </div>
              <h3 className="text-lg font-semibold text-primary-text mb-2">
                No missions yet
              </h3>
              <p className="text-secondary-text mb-4">
                Start by creating your first strategic mission to organize your
                quests and objectives.
              </p>
              <Button
                onClick={() => setNewMissionOpen(true)}
                className="bg-primary/80 hover:bg-primary/90 border border-accent-text/50 text-accent-text font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-accent-text/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                Initialize First Mission
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {(missions || []).map(mission => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onDelete={() => setMissionToDelete(mission)}
                onEdit={() => handleEditMission(mission)}
                onArchive={() => handleArchiveMission(mission)}
                onViewQuests={() => handleViewQuests(mission.id)}
              />
            ))}
          </div>
        )}

        {/* New Mission Dialog */}
        <NewMissionDialog
          open={newMissionOpen}
          onOpenChange={setNewMissionOpen}
        />

        {/* Edit Mission Dialog */}
        <EditMissionDialog
          open={editMissionOpen}
          onOpenChange={setEditMissionOpen}
          mission={missionToEdit}
        />

        {/* Archive Mission Dialog */}
        <ArchiveMissionDialog
          open={archiveMissionOpen}
          onOpenChange={setArchiveMissionOpen}
          mission={missionToArchive}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!missionToDelete}
          onOpenChange={() => setMissionToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Mission</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{missionToDelete?.title}
                &quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4 my-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="deleteQuests"
                  checked={deleteQuests}
                  onCheckedChange={checked =>
                    setDeleteQuests(checked as boolean)
                  }
                />
                <div className="space-y-1">
                  <label
                    htmlFor="deleteQuests"
                    className="text-sm text-primary-text cursor-pointer"
                  >
                    Also delete all quests in this mission ({questCount} quests)
                  </label>
                  {questCount > 0 && (
                    <p className="text-xs text-secondary-text">
                      This will permanently remove all {questCount} quest
                      {questCount !== 1 ? 's' : ''} associated with this
                      mission.
                    </p>
                  )}
                </div>
              </div>

              {deleteQuests && questCount > 0 && (
                <div className="flex items-start space-x-2 p-3 rounded-md bg-danger/10 border border-danger/20">
                  <AlertTriangle className="h-4 w-4 text-danger flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-danger">
                      Warning: Quest Deletion
                    </p>
                    <p className="text-xs text-danger/80">
                      You are about to permanently delete {questCount} quest
                      {questCount !== 1 ? 's' : ''}. This includes all quest
                      data, notes, and progress. This action cannot be undone.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteMission}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Mission'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DataErrorBoundary>
  );
}
