'use client';

import { useState } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import {
  formatTime,
  convertMinutesToTimeUnits,
  convertTimeUnitsToMinutes,
} from '@/lib/time-utils';
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
import { Input } from '@/components/ui/input';
import { Trophy, Clock, Target, Star } from 'lucide-react';
import { Quest } from '@/types';
import { satisfactionEmojis } from '@/types/satisfaction';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';
import { FormErrorBoundary } from '@/components/error-boundary-enhanced';

interface MissionDebriefDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (debriefData: {
    actualTime: number;
    debriefNotes: string;
    debriefSatisfaction: number | null;
  }) => Promise<void>;
  quest: Quest;
}

export function MissionDebriefDialog({
  open,
  onOpenChange,
  onComplete,
  quest,
}: MissionDebriefDialogProps) {
  const [debriefNotes, setDebriefNotes] = useState('');
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const suggestedTimeMinutes = quest?.startedAt
    ? differenceInMinutes(new Date(), quest.startedAt)
    : 0;

  const suggestedTime = convertMinutesToTimeUnits(suggestedTimeMinutes);

  const [actualDays, setActualDays] = useState(suggestedTime.days);
  const [actualHours, setActualHours] = useState(suggestedTime.hours);
  const [actualMinutes, setActualMinutes] = useState(suggestedTime.minutes);

  const getActualTimeInMinutes = () => {
    return convertTimeUnitsToMinutes(actualDays, actualHours, actualMinutes);
  };

  const getTimeComparison = () => {
    if (!quest?.estimatedTime) return null;
    const actualTimeMinutes = getActualTimeInMinutes();
    const difference = actualTimeMinutes - quest.estimatedTime;
    const percentage = Math.round((difference / quest.estimatedTime) * 100);
    return { difference, percentage };
  };

  const timeComparison = getTimeComparison();

  const handleComplete = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onComplete({
        actualTime: getActualTimeInMinutes(),
        debriefNotes: debriefNotes.trim(),
        debriefSatisfaction: satisfaction,
      });
      // Reset form
      setDebriefNotes('');
      setSatisfaction(null);
      const resetTime = convertMinutesToTimeUnits(suggestedTimeMinutes);
      setActualDays(resetTime.days);
      setActualHours(resetTime.hours);
      setActualMinutes(resetTime.minutes);
    } catch (error) {
      console.error('Failed to complete mission debrief:', error);
      showEnhancedErrorToast(error, {
        context: 'Mission Debrief',
        onRetry: () => handleComplete(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form
    setDebriefNotes('');
    setSatisfaction(null);
    const resetTime = convertMinutesToTimeUnits(suggestedTimeMinutes);
    setActualDays(resetTime.days);
    setActualHours(resetTime.hours);
    setActualMinutes(resetTime.minutes);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <FormErrorBoundary context="mission debrief">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center justify-center">
              <Trophy className="h-6 w-6 text-yellow-400" />
              MISSION ACCOMPLISHED
              <Trophy className="h-6 w-6 text-yellow-400" />
            </DialogTitle>
            <DialogDescription className="text-center">
              <span className="text-green-400 font-medium text-lg animate-pulse">
                {quest?.title || 'Quest'}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* SUCCESS Animation Section */}
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-4xl mb-1 animate-bounce">🎉</div>
              <div className="text-green-400 font-bold text-lg mb-1">
                SUCCESS
              </div>
              <div className="text-green-300 text-sm">
                Mission completed at {format(new Date(), 'HH:mm')} hrs
              </div>
            </div>

            {/* Reality Check Section */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Reality Check
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="text-blue-400 font-medium mb-1">
                    Initial Estimate
                  </div>
                  <div className="text-2xl font-bold text-blue-300">
                    {quest?.estimatedTime
                      ? formatTime(quest.estimatedTime)
                      : 'No estimate'}
                  </div>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="text-green-400 font-medium mb-1">
                    Actual Time
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="space-y-1 flex-1">
                        <Label className="text-xs text-green-300/70 uppercase tracking-wider">
                          Days
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          value={actualDays}
                          onChange={e => {
                            const days = Math.max(
                              0,
                              parseInt(e.target.value) || 0
                            );
                            setActualDays(days);
                          }}
                          className="text-center"
                        />
                      </div>
                      <div className="space-y-1 flex-1">
                        <Label className="text-xs text-green-300/70 uppercase tracking-wider">
                          Hours
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          value={actualHours}
                          onChange={e => {
                            const hours = Math.max(
                              0,
                              parseInt(e.target.value) || 0
                            );
                            setActualHours(hours);
                          }}
                          className="text-center"
                        />
                      </div>
                      <div className="space-y-1 flex-1">
                        <Label className="text-xs text-green-300/70 uppercase tracking-wider">
                          Minutes
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          value={actualMinutes}
                          onChange={e => {
                            const minutes = Math.max(
                              0,
                              parseInt(e.target.value) || 0
                            );
                            setActualMinutes(minutes);
                          }}
                          className="text-center"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-green-300/70">
                      Suggested time. Edit to reflect your actual focused work.
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Comparison */}
              {timeComparison && (
                <div
                  className={`p-2 rounded-lg border ${
                    timeComparison.difference > 0
                      ? 'bg-orange-500/10 border-orange-500/20'
                      : 'bg-green-500/10 border-green-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      {timeComparison.difference > 0 ? (
                        <span className="text-orange-300">
                          {Math.abs(timeComparison.percentage)}% over estimate
                          (+
                          {formatTime(Math.abs(timeComparison.difference))})
                        </span>
                      ) : (
                        <span className="text-green-300">
                          {Math.abs(timeComparison.percentage)}% under estimate
                          (-
                          {formatTime(Math.abs(timeComparison.difference))})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Intel Gathering Section */}
            <div className="space-y-2">
              <Label htmlFor="debrief-notes">
                Intel Gathering{' '}
                <span className="text-xs text-[var(--color-secondary-text)]">
                  (Optional)
                </span>
              </Label>
              <Textarea
                id="debrief-notes"
                value={debriefNotes}
                onChange={e => setDebriefNotes(e.target.value)}
                placeholder="What did you learn? Any obstacles or insights?"
                rows={2}
                maxLength={5000}
              />
              {debriefNotes.length >= 4500 && (
                <div className="text-xs text-[var(--color-secondary-text)] text-right">
                  {debriefNotes.length}/5000
                </div>
              )}
            </div>

            {/* Tactical Satisfaction Section */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Tactical Satisfaction
              </Label>
              <div className="grid grid-cols-5 gap-2 p-3 bg-[var(--color-surface-secondary)] rounded-lg">
                {satisfactionEmojis.map(item => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSatisfaction(item.value)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all min-h-[64px] ${
                      satisfaction === item.value
                        ? 'bg-blue-500/20 border-2 border-blue-500/50 scale-110'
                        : 'hover:bg-blue-500/10 border-2 border-transparent'
                    }`}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-xs text-center leading-tight">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
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
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Completing...' : 'Complete Mission'}
            </Button>
          </DialogFooter>
        </FormErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}
