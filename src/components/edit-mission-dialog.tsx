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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mission } from '@/types';
import {
  showEnhancedSuccessToast,
  showEnhancedErrorToast,
} from '@/lib/toast-enhanced';
import { FormErrorBoundary } from '@/components/error-boundary-enhanced';

interface EditMissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission: Mission | null;
}

export function EditMissionDialog({
  open,
  onOpenChange,
  mission,
}: EditMissionDialogProps) {
  const updateMission = useCommandOpsStore(state => state.updateMission);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  // Populate form when mission changes
  useEffect(() => {
    if (mission) {
      setTitle(mission.title);
      setDescription(mission.objective || '');
    }
  }, [mission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting || !mission) return;

    setIsSubmitting(true);
    try {
      await updateMission(mission.id, {
        title: title.trim(),
        objective: description.trim() || null,
      });

      showEnhancedSuccessToast('Mission updated successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update mission:', error);
      showEnhancedErrorToast(error, {
        context: 'Mission Update',
        onRetry: async () => {
          if (!title.trim() || !mission) return;
          setIsSubmitting(true);
          try {
            await updateMission(mission.id, {
              title: title.trim(),
              objective: description.trim() || null,
            });
            showEnhancedSuccessToast('Mission updated successfully!');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <FormErrorBoundary context="mission editing">
          <DialogHeader>
            <DialogTitle>Edit Mission</DialogTitle>
            <DialogDescription>
              Update mission parameters and objectives
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Mission Title <span className="text-danger">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={e => {
                  const value = e.target.value;
                  setTitle(value);
                  if (value.length > 500) {
                    setTitleError('Title must be 500 characters or less');
                  } else {
                    setTitleError('');
                  }
                }}
                placeholder="Operation: Code Refactor"
                required
                maxLength={500}
                className={titleError ? 'border-red-500' : ''}
              />
              {titleError && (
                <p className="text-sm text-red-500 mt-1">{titleError}</p>
              )}
              {title.length >= 400 && (
                <p className="text-xs text-muted-foreground text-right">
                  {title.length}/500 characters
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mission Briefing</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => {
                  const value = e.target.value;
                  setDescription(value);
                  if (value.length > 5000) {
                    setDescriptionError(
                      'Mission briefing must be 5000 characters or less'
                    );
                  } else {
                    setDescriptionError('');
                  }
                }}
                placeholder="Describe the mission objectives and scope..."
                className={`min-h-[100px] ${descriptionError ? 'border-red-500' : ''}`}
                maxLength={5000}
              />
              {descriptionError && (
                <p className="text-sm text-red-500 mt-1">{descriptionError}</p>
              )}
              {description.length >= 4500 && (
                <p className="text-xs text-muted-foreground text-right">
                  {description.length}/5000 characters
                </p>
              )}
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
                disabled={
                  !title.trim() ||
                  isSubmitting ||
                  !!titleError ||
                  !!descriptionError
                }
                className="min-h-[44px]"
              >
                {isSubmitting ? 'Updating...' : 'Update Mission'}
              </Button>
            </DialogFooter>
          </form>
        </FormErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}
