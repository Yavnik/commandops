'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useCommandOpsStore } from '@/store/command-ops-store';
import { Quest } from '@/types';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';

interface NewQuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editQuest?: Quest | null; // If provided, dialog is in edit mode
}

export function NewQuestDialog({
  open,
  onOpenChange,
  editQuest,
}: NewQuestDialogProps) {
  const { addQuest, updateQuest, missions, isLoading } = useCommandOpsStore();
  const isEditMode = !!editQuest;

  const [designation, setDesignation] = useState('');
  const [briefing, setBriefing] = useState('');
  const [isCritical, setIsCritical] = useState<boolean>(false);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [missionId, setMissionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [designationError, setDesignationError] = useState('');
  const [briefingError, setBriefingError] = useState('');

  // Reset form
  const resetForm = () => {
    setDesignation('');
    setBriefing('');
    setIsCritical(false);
    setDeadline(null);
    setMissionId(null);
    setDesignationError('');
    setBriefingError('');
  };

  // Initialize form with edit data when in edit mode
  useEffect(() => {
    if (open) {
      if (isEditMode && editQuest) {
        setDesignation(editQuest.title);
        setBriefing(editQuest.description || '');
        setIsCritical(editQuest.isCritical ?? false);
        setDeadline(editQuest.deadline ? new Date(editQuest.deadline) : null);
        setMissionId(editQuest.missionId || null);
      } else {
        resetForm();
      }
    }
  }, [open, isEditMode, editQuest]);

  const roundToNext15Minutes = (date: Date) => {
    const minutes = date.getMinutes();
    const remainder = minutes % 15;
    if (remainder === 0) {
      return date; // Already on 15-minute increment
    }
    const nextIncrement = minutes + (15 - remainder);
    date.setMinutes(nextIncrement, 0, 0);
    return date;
  };

  const isDeadlineInPast = (deadline: Date | null) => {
    if (!deadline) return false;
    return deadline.getTime() <= new Date().getTime();
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getCurrentHour = () => new Date().getHours();
  const getCurrentMinute = () => new Date().getMinutes();

  const shouldShowTodayEOD = () => {
    const now = new Date();
    return (
      now.getHours() < 23 || (now.getHours() === 23 && now.getMinutes() < 45)
    );
  };

  // Set default deadline when modal opens (only for new quests)
  useEffect(() => {
    if (open && !deadline && !isEditMode) {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      const rounded = roundToNext15Minutes(now);
      setDeadline(rounded);
    }
  }, [open, deadline, isEditMode]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setDeadline(null);
      setIsCalendarOpen(false);
      return;
    }
    const newDeadline = deadline ? new Date(deadline) : new Date();
    newDeadline.setFullYear(date.getFullYear());
    newDeadline.setMonth(date.getMonth());
    newDeadline.setDate(date.getDate());

    // If no previous deadline or selecting today (and not in edit mode), set to +1 hour rounded to next 15min
    if ((!deadline || isToday(newDeadline)) && !isEditMode) {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      const rounded = roundToNext15Minutes(now);
      newDeadline.setHours(rounded.getHours(), rounded.getMinutes(), 0, 0);
    }

    setDeadline(newDeadline);
    setIsCalendarOpen(false); // Close calendar after selection
  };

  const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
    const newDeadline = deadline ? new Date(deadline) : new Date();
    if (type === 'hour') {
      newDeadline.setHours(parseInt(value, 10));
    } else {
      newDeadline.setMinutes(parseInt(value, 10));
    }

    // Prevent setting past time (only for new quests, not edit mode)
    if (!isEditMode && isDeadlineInPast(newDeadline)) {
      return; // Don't update if it would create a past time
    }

    setDeadline(newDeadline);
  };

  const isHourDisabled = (hour: number) => {
    if (!deadline || !isToday(deadline)) return false;
    return hour < getCurrentHour();
  };

  const isMinuteDisabled = (minute: number) => {
    if (!deadline || !isToday(deadline)) return false;
    const selectedHour = deadline.getHours();
    const currentHour = getCurrentHour();
    const currentMinute = getCurrentMinute();

    // If selected hour is past current hour, all minutes are allowed
    if (selectedHour > currentHour) return false;

    // If selected hour is current hour, disable past minutes
    if (selectedHour === currentHour) {
      return minute < currentMinute;
    }

    // If selected hour is before current hour, all minutes are disabled
    return true;
  };

  const handleSubmit = async () => {
    if (
      !designation.trim() ||
      isSubmitting ||
      (!isEditMode && isDeadlineInPast(deadline))
    )
      return;

    setIsSubmitting(true);
    try {
      if (isEditMode && editQuest) {
        await updateQuest(editQuest.id, {
          title: designation.trim(),
          description: briefing.trim() || null,
          isCritical: Boolean(isCritical),
          deadline: deadline,
          missionId: missionId || null,
          estimatedTime: editQuest.estimatedTime, // Keep original estimated time
        });
      } else {
        await addQuest({
          title: designation.trim(),
          description: briefing.trim() || null,
          isCritical: Boolean(isCritical),
          deadline: deadline,
          missionId: missionId,
        });
      }

      // Reset form
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error(
        `Failed to ${isEditMode ? 'update' : 'create'} quest:`,
        error
      );
      showEnhancedErrorToast(error, {
        context: `Quest ${isEditMode ? 'Update' : 'Creation'}`,
        onRetry: handleSubmit,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Modify Quest Parameters' : 'Deploy New Quest'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update mission specifications and tactical parameters below.'
              : 'Initialize a new mission directive. Provide tactical parameters below.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          {/* Quest Designation */}
          <div className="space-y-2">
            <Label htmlFor="designation">Quest Designation</Label>
            <Input
              id="designation"
              value={designation}
              onChange={e => {
                const value = e.target.value;
                setDesignation(value);
                if (value.length > 500) {
                  setDesignationError(
                    'Quest title must be 500 characters or less'
                  );
                } else {
                  setDesignationError('');
                }
              }}
              placeholder="Enter mission title..."
              maxLength={500}
              className={designationError ? 'border-red-500' : ''}
            />
            {designationError && (
              <p className="text-sm text-red-500 mt-1">{designationError}</p>
            )}
            {designation.length >= 400 && (
              <p className="text-xs text-muted-foreground text-right">
                {designation.length}/500 characters
              </p>
            )}
          </div>

          {/* Mission Briefing */}
          <div className="space-y-2">
            <Label htmlFor="briefing">Mission Briefing</Label>
            <Textarea
              id="briefing"
              value={briefing}
              onChange={e => {
                const value = e.target.value;
                setBriefing(value);
                if (value.length > 5000) {
                  setBriefingError(
                    'Mission briefing must be 5000 characters or less'
                  );
                } else {
                  setBriefingError('');
                }
              }}
              placeholder="Describe mission parameters..."
              rows={3}
              maxLength={5000}
              className={briefingError ? 'border-red-500' : ''}
            />
            {briefingError && (
              <p className="text-sm text-red-500 mt-1">{briefingError}</p>
            )}
            {briefing.length >= 4500 && (
              <p className="text-xs text-muted-foreground text-right">
                {briefing.length}/5000 characters
              </p>
            )}
          </div>

          {/* Priority Level */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                onClick={() => setIsCritical(false)}
                variant="ghost"
                className={`flex-1 min-h-[44px] ${
                  !isCritical
                    ? 'bg-[var(--color-button-default-bg)] border-[var(--color-button-default-border)] text-[var(--color-button-default-text)] hover:bg-[var(--color-button-default-bg)]/30'
                    : 'text-[var(--color-secondary-text)] hover:text-[var(--color-button-default-text)] hover:bg-[var(--color-button-default-bg)]/10'
                }`}
              >
                Standard Priority
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCritical(true)}
                className={`flex-1 min-h-[44px] ${
                  isCritical
                    ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 hover:text-red-400'
                    : 'bg-transparent border-none text-[var(--color-secondary-text)] hover:text-red-400 hover:bg-red-500/10'
                }`}
              >
                Critical Priority
              </Button>
            </div>
          </div>

          {/* Mission Selection */}
          <div className="space-y-2">
            <Label htmlFor="mission">Mission Assignment</Label>
            <div className="flex items-center gap-2">
              <div className="flex-grow">
                <Select
                  key={missionId || 'select-mission'}
                  value={missionId || undefined}
                  onValueChange={value =>
                    setMissionId(value === 'no-mission' ? null : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select mission (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading.missions ? (
                      <SelectItem value="loading" disabled>
                        Loading missions...
                      </SelectItem>
                    ) : missions.length === 0 ? (
                      <SelectItem value="no-missions-available" disabled>
                        No Missions
                      </SelectItem>
                    ) : (
                      <>
                        <SelectItem value="no-mission">No Mission</SelectItem>
                        {(missions || []).map(mission => (
                          <SelectItem key={mission.id} value={mission.id}>
                            {mission.title}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {missionId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setMissionId(null)}
                  aria-label="Clear mission selection"
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Target Date/Time */}
          <div className="space-y-2">
            <Label>Deadline</Label>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <div className="flex flex-col space-y-1">
                <Label className="text-xs text-[var(--color-secondary-text)] uppercase tracking-wider">
                  Date
                </Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="input-like"
                      className={cn(
                        'w-full sm:w-[280px] justify-start text-left font-normal h-10',
                        !deadline && 'text-muted-foreground'
                      )}
                      style={{
                        borderRadius: 'var(--border-radius-md, 0.375rem)',
                      }}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? (
                        format(deadline, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 ml-12"
                    style={{
                      backgroundColor: 'var(--color-dialog-bg)',
                      border: '1px solid var(--color-dialog-border)',
                      boxShadow: 'var(--color-dialog-shadow)',
                      borderRadius: '0.75rem',
                    }}
                  >
                    <Calendar
                      mode="single"
                      selected={deadline || undefined}
                      onSelect={handleDateSelect}
                      disabled={date =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                      style={{
                        backgroundColor: 'var(--color-dialog-bg)',
                        borderRadius: '0.75rem',
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-[var(--color-secondary-text)] uppercase tracking-wider">
                    Hour
                  </Label>
                  <Select
                    onValueChange={value => handleTimeChange('hour', value)}
                    value={deadline ? String(deadline.getHours()) : undefined}
                    disabled={!deadline}
                  >
                    <SelectTrigger className="w-full sm:w-[120px]">
                      <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem
                          key={i}
                          value={String(i)}
                          disabled={isHourDisabled(i)}
                        >
                          {String(i).padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-[var(--color-secondary-text)] uppercase tracking-wider">
                    Minute
                  </Label>
                  <Select
                    onValueChange={value => handleTimeChange('minute', value)}
                    value={deadline ? String(deadline.getMinutes()) : undefined}
                    disabled={!deadline}
                  >
                    <SelectTrigger className="w-full sm:w-[120px]">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 15, 30, 45].map(minute => (
                        <SelectItem
                          key={minute}
                          value={String(minute)}
                          disabled={isMinuteDisabled(minute)}
                        >
                          {String(minute).padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  now.setHours(now.getHours() + 1); // Add 1 hour
                  const rounded = roundToNext15Minutes(now);
                  setDeadline(rounded);
                }}
                className="text-xs"
              >
                +1 Hour
              </Button>
              {shouldShowTodayEOD() && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    today.setHours(23, 45, 0, 0); // 11:45 PM EOD
                    setDeadline(today);
                  }}
                  className="text-xs"
                >
                  Today EOD
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  tomorrow.setHours(23, 45, 0, 0); // 11:45 PM EOD
                  setDeadline(tomorrow);
                }}
                className="text-xs"
              >
                Tomorrow EOD
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  nextWeek.setHours(23, 45, 0, 0); // 11:45 PM EOD
                  setDeadline(nextWeek);
                }}
                className="text-xs"
              >
                Next Week
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="min-h-[44px]"
          >
            Cancel Protocol
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !designation.trim() ||
              isSubmitting ||
              (!isEditMode && isDeadlineInPast(deadline)) ||
              !!designationError ||
              !!briefingError
            }
            className="min-h-[44px]"
          >
            {isSubmitting
              ? isEditMode
                ? 'Updating...'
                : 'Deploying...'
              : isEditMode
                ? 'Update Quest'
                : 'Deploy Quest'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
