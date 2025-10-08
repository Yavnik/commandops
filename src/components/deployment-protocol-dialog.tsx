'use client';

import { useState } from 'react';
import { format, addMinutes } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock } from 'lucide-react';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';
import { FormErrorBoundary } from '@/components/error-boundary-enhanced';

interface DeploymentProtocolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeploy: (
    estimatedTime: number | null,
    firstAction: string
  ) => Promise<void>;
  questTitle: string;
}

export function DeploymentProtocolDialog({
  open,
  onOpenChange,
  onDeploy,
  questTitle,
}: DeploymentProtocolDialogProps) {
  const [estimatedDays, setEstimatedDays] = useState<number>(0);
  const [estimatedHours, setEstimatedHours] = useState<number>(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(0);
  const [firstAction, setFirstAction] = useState('');
  const [firstActionError, setFirstActionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getEstimatedTimeInMinutes = () => {
    const totalMinutes =
      estimatedDays * 24 * 60 + estimatedHours * 60 + estimatedMinutes;
    return totalMinutes > 0 ? totalMinutes : null;
  };

  const getEstimatedCompletionTime = () => {
    const totalMinutes = getEstimatedTimeInMinutes();
    if (!totalMinutes) return null;

    const now = new Date();
    const completionTime = addMinutes(now, totalMinutes);
    return completionTime;
  };

  const handleDeploy = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onDeploy(getEstimatedTimeInMinutes(), firstAction.trim());
      // Reset form
      setEstimatedDays(0);
      setEstimatedHours(0);
      setEstimatedMinutes(0);
      setFirstAction('');
      setFirstActionError('');
    } catch (error) {
      console.error('Failed to deploy quest:', error);
      showEnhancedErrorToast(error, {
        context: 'Quest Deployment',
        onRetry: () => handleDeploy(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form
    setEstimatedDays(0);
    setEstimatedHours(0);
    setEstimatedMinutes(0);
    setFirstAction('');
    setFirstActionError('');
  };

  const setQuickTime = (totalMinutes: number) => {
    const days = Math.floor(totalMinutes / (24 * 60));
    const remainingMinutes = totalMinutes % (24 * 60);
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;

    setEstimatedDays(days);
    setEstimatedHours(hours);
    setEstimatedMinutes(minutes);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
        <FormErrorBoundary context="quest deployment protocol">
          <DialogHeader>
            <DialogTitle>Deployment Protocol</DialogTitle>
            <DialogDescription>
              Preparing to activate:{' '}
              <span className="text-blue-400 font-medium">{questTitle}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Plan of Attack - Estimated Time */}
            <div className="space-y-3">
              <Label>Estimated Time</Label>

              {/* Days + Hours + Minutes Selector */}
              <div className="flex gap-2">
                <div className="space-y-1 flex-1">
                  <Label className="text-xs text-[var(--color-secondary-text)] uppercase tracking-wider">
                    Days
                  </Label>
                  <Select
                    value={String(estimatedDays)}
                    onValueChange={value =>
                      setEstimatedDays(parseInt(value, 10))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="0" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 flex-1">
                  <Label className="text-xs text-[var(--color-secondary-text)] uppercase tracking-wider">
                    Hours
                  </Label>
                  <Select
                    value={String(estimatedHours)}
                    onValueChange={value =>
                      setEstimatedHours(parseInt(value, 10))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="0" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 flex-1">
                  <Label className="text-xs text-[var(--color-secondary-text)] uppercase tracking-wider">
                    Minutes
                  </Label>
                  <Select
                    value={String(estimatedMinutes)}
                    onValueChange={value =>
                      setEstimatedMinutes(parseInt(value, 10))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="0" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 15, 30, 45].map(minute => (
                        <SelectItem key={minute} value={String(minute)}>
                          {minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Time Presets */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuickTime(30)}
                  className="text-xs"
                >
                  30m
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuickTime(60)}
                  className="text-xs"
                >
                  1h
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuickTime(180)}
                  className="text-xs"
                >
                  3h
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuickTime(1440)}
                  className="text-xs"
                >
                  1d
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuickTime(10080)}
                  className="text-xs"
                >
                  1w
                </Button>
              </div>

              {/* Estimated Completion Time */}
              {getEstimatedCompletionTime() && (
                <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-blue-300">
                    <span className="font-medium">Estimated completion:</span>{' '}
                    {format(getEstimatedCompletionTime()!, 'EEE, MMM d, HH:mm')}{' '}
                    hrs
                  </span>
                </div>
              )}
            </div>

            {/* First Tactical Step */}
            <div className="space-y-2">
              <Label htmlFor="first-action">First Tactical Step</Label>
              <Textarea
                id="first-action"
                value={firstAction}
                onChange={e => {
                  const value = e.target.value;
                  setFirstAction(value);
                  if (value.length > 1000) {
                    setFirstActionError(
                      'First tactical step must be 1000 characters or less'
                    );
                  } else {
                    setFirstActionError('');
                  }
                }}
                placeholder="What is your very first physical action?"
                rows={3}
                maxLength={1000}
                className={firstActionError ? 'border-red-500' : ''}
              />
              {firstActionError && (
                <p className="text-sm text-red-500 mt-1">{firstActionError}</p>
              )}
              {firstAction.length >= 900 && (
                <p className="text-xs text-muted-foreground text-right">
                  {firstAction.length}/1000 characters
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel Protocol
            </Button>
            <Button
              onClick={handleDeploy}
              disabled={!!firstActionError || isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Deploying...' : 'Deploy Quest'}
            </Button>
          </DialogFooter>
        </FormErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}
