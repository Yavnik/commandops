'use client';

import { useState, useEffect } from 'react';
import { useCommandOpsStore } from '@/store/command-ops-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mission } from '@/types';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';
import { FormErrorBoundary } from '@/components/error-boundary-enhanced';
import { Archive, AlertTriangle } from 'lucide-react';

interface ArchiveMissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission: Mission | null;
}

export function ArchiveMissionDialog({
  open,
  onOpenChange,
  mission,
}: ArchiveMissionDialogProps) {
  const archiveMission = useCommandOpsStore(state => state.archiveMission);
  const [afterActionReport, setAfterActionReport] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportError, setReportError] = useState('');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setAfterActionReport('');
      setReportError('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !mission) return;

    setIsSubmitting(true);
    try {
      await archiveMission(mission.id, afterActionReport.trim() || undefined);

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to archive mission:', error);
      showEnhancedErrorToast(error, {
        context: 'Mission Archive',
        onRetry: async () => {
          if (!mission) return;
          setIsSubmitting(true);
          try {
            await archiveMission(
              mission.id,
              afterActionReport.trim() || undefined
            );
            onOpenChange(false);
          } catch (retryError) {
            console.error('Retry failed:', retryError);
          } finally {
            setIsSubmitting(false);
          }
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate pending quests
  const pendingQuests = mission
    ? mission.totalQuestCount - mission.completedQuestCount
    : 0;
  const canArchive = pendingQuests === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <FormErrorBoundary context="mission archive">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Archive Mission
            </DialogTitle>
            <DialogDescription>
              File your after action report and archive this mission
            </DialogDescription>
          </DialogHeader>

          {!canArchive && (
            <div className="flex items-start space-x-2 p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-500">
                  Cannot Archive Mission
                </p>
                <p className="text-xs text-amber-500/80">
                  There are {pendingQuests} pending quest
                  {pendingQuests !== 1 ? 's' : ''} which need
                  {pendingQuests === 1 ? 's' : ''} to be completed before
                  archiving this mission.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="afterActionReport">
                After Action Report
                <span className="text-sm text-secondary-text ml-1">
                  (Optional)
                </span>
              </Label>
              <Textarea
                id="afterActionReport"
                value={afterActionReport}
                onChange={e => {
                  const value = e.target.value;
                  setAfterActionReport(value);
                  if (value.length > 10000) {
                    setReportError(
                      'After action report must be 10000 characters or less'
                    );
                  } else {
                    setReportError('');
                  }
                }}
                placeholder="Document lessons learned, outcomes achieved, and key insights from this mission..."
                className={`min-h-[120px] ${reportError ? 'border-red-500' : ''}`}
                disabled={!canArchive}
                maxLength={10000}
              />
              {reportError && (
                <p className="text-sm text-red-500 mt-1">{reportError}</p>
              )}
              {afterActionReport.length >= 9000 && (
                <p className="text-xs text-muted-foreground text-right">
                  {afterActionReport.length}/10000 characters
                </p>
              )}
              <p className="text-xs text-secondary-text">
                This report will be saved as part of the mission record for
                future reference.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="min-h-[44px]"
              >
                Cancel Protocol
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !canArchive || !!reportError}
                className="min-h-[44px]"
              >
                {isSubmitting ? (
                  'Archiving...'
                ) : (
                  <>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Mission
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}
