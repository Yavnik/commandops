'use client';

import { useState } from 'react';
import { Quest } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Zap } from 'lucide-react';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';
import { FormErrorBoundary } from '@/components/error-boundary-enhanced';

interface EmergencyDeployModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quest: Quest | null;
  activeQuestCount: number;
  onDeploy: (
    estimatedTime: number | null,
    firstAction: string,
    isEmergency: boolean
  ) => Promise<void>;
}

export function EmergencyDeployModal({
  open,
  onOpenChange,
  quest,
  activeQuestCount,
  onDeploy,
}: EmergencyDeployModalProps) {
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [firstAction, setFirstAction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (isEmergency: boolean) => {
    if (!quest) return;

    setIsSubmitting(true);
    try {
      const timeValue = estimatedTime ? parseInt(estimatedTime) : null;
      await onDeploy(timeValue, firstAction, isEmergency);

      // Reset form
      setEstimatedTime('');
      setFirstAction('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to deploy quest:', error);
      showEnhancedErrorToast(error, {
        context: 'Quest Deployment',
        onRetry: () => handleSubmit(true),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!quest) return null;

  const isAtLimit = activeQuestCount >= 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800">
        <FormErrorBoundary context="emergency quest deployment">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-100">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              {isAtLimit ? 'Emergency Deploy Protocol' : 'Deploy Quest'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {isAtLimit
                ? `You have ${activeQuestCount} active quests. Emergency deployment will temporarily allow a 4th active quest.`
                : 'Configure deployment parameters for this quest.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Quest Title */}
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <h3 className="font-semibold text-gray-200 mb-1">
                {quest.title}
              </h3>
              {quest.description && (
                <p className="text-sm text-gray-400">{quest.description}</p>
              )}
            </div>

            {/* Warning for emergency deploy */}
            {isAtLimit && (
              <div className="bg-orange-900/30 border border-orange-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-orange-100 font-medium">
                      Emergency Deploy Warning
                    </p>
                    <p className="text-orange-200/80 mt-1">
                      This will temporarily allow you to exceed the 3-quest
                      limit. The Active Operations column will enter a danger
                      state until you complete a quest.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Estimated Time */}
            <div className="space-y-2">
              <Label htmlFor="estimated-time" className="text-gray-300">
                Estimated Time (minutes)
              </Label>
              <Input
                id="estimated-time"
                type="number"
                placeholder="e.g., 45"
                value={estimatedTime}
                onChange={e => setEstimatedTime(e.target.value)}
                className="bg-gray-800 border-gray-700 text-gray-100"
                min="1"
              />
            </div>

            {/* First Tactical Step */}
            <div className="space-y-2">
              <Label htmlFor="first-action" className="text-gray-300">
                First Tactical Step
              </Label>
              <Textarea
                id="first-action"
                placeholder="What is your very first physical action to begin this quest?"
                value={firstAction}
                onChange={e => setFirstAction(e.target.value)}
                className="bg-gray-800 border-gray-700 text-gray-100 min-h-[80px]"
              />
              <p className="text-xs text-gray-500">
                This helps combat task initiation paralysis by defining the
                first concrete step.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>

            {!isAtLimit && (
              <Button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Deploying...' : 'Deploy Quest'}
              </Button>
            )}

            <Button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Emergency Deploying...' : 'Emergency Deploy'}
            </Button>
          </div>
        </FormErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}
