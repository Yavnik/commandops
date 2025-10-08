'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
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
import { submitFeedbackAction } from '@/app/actions/feedback';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [messageError, setMessageError] = useState('');

  const resetForm = () => {
    setMessage('');
    setMessageError('');
    setShowThankYou(false);
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing dialog
      setTimeout(() => resetForm(), 150); // Small delay to allow dialog close animation
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async () => {
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitFeedbackAction({
        message: message.trim(),
      });

      // Show thank you message
      setShowThankYou(true);

      // Auto-close dialog after showing thank you
      setTimeout(() => {
        handleDialogOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      showEnhancedErrorToast(error, {
        context: 'Feedback Submission',
        onRetry: handleSubmit,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
    if (value.length > 10000) {
      setMessageError('Feedback message must be 10000 characters or less');
    } else {
      setMessageError('');
    }
  };

  if (showThankYou) {
    return (
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <div
              className="rounded-full p-3"
              style={{
                backgroundColor: 'var(--color-success-bg, #10b981)',
                color: 'var(--color-success-text, #ffffff)',
              }}
            >
              <CheckCircle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3
                className="text-lg font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-accent-text)' }}
              >
                Mission Acknowledged
              </h3>
              <p
                className="text-sm"
                style={{ color: 'var(--color-secondary-text)' }}
              >
                Thank you for your valuable input, operative. Your feedback has
                been logged and will be reviewed by command.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
          <DialogDescription>
            Share your thoughts, suggestions, or report issues to help improve
            Command Center operations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-message">Your Feedback</Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={e => handleMessageChange(e.target.value)}
              placeholder="Tell us what's on your mind..."
              rows={6}
              maxLength={10000}
              className={messageError ? 'border-red-500' : ''}
            />
            {messageError && (
              <p className="text-sm text-red-500 mt-1">{messageError}</p>
            )}
            {message.length >= 9000 && (
              <p className="text-xs text-muted-foreground text-right">
                {message.length}/10000 characters
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => handleDialogOpenChange(false)}
            className="min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || isSubmitting || !!messageError}
            className="min-h-[44px]"
          >
            {isSubmitting ? 'Sending...' : 'Send Feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
