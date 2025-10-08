'use client';

import { useState } from 'react';
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
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';

interface NewMissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewMissionDialog({
  open,
  onOpenChange,
}: NewMissionDialogProps) {
  const addMission = useCommandOpsStore(state => state.addMission);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addMission({
        title: title.trim(),
        objective: description.trim() || null,
        status: 'ACTIVE',
      });

      // Reset form
      setTitle('');
      setDescription('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create mission:', error);
      showEnhancedErrorToast(error, {
        context: 'Mission Creation',
        onRetry: () => handleSubmit(e),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Initialize New Mission</DialogTitle>
          <DialogDescription>
            Create a new operational campaign to organize your objectives
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
              {isSubmitting ? 'Launching...' : 'Launch Mission'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
