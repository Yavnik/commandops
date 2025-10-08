'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCommandOpsStore } from '@/store/command-ops-store';
import { X } from 'lucide-react';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';

interface InterruptCaptureProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InterruptCapture({ isOpen, onClose }: InterruptCaptureProps) {
  const [title, setTitle] = useState('');
  const [countdown, setCountdown] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addQuest } = useCommandOpsStore();

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setCountdown(15);
      setIsSubmitting(false);

      // Focus input after a brief delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      // Start countdown
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await addQuest({
        title: title.trim(),
        description: null,
        missionId: null,
        isCritical: false,
        deadline: null,
      });
      onClose();
    } catch (error) {
      console.error('Failed to capture interrupt:', error);
      showEnhancedErrorToast(error, {
        context: 'Interrupt Capture',
        onRetry: async () => {
          if (!title.trim()) return;
          setIsSubmitting(true);
          try {
            await addQuest({
              title: title.trim(),
              description: null,
              missionId: null,
              isCritical: false,
              deadline: null,
            });
            onClose();
          } catch (retryError) {
            console.error('Retry failed:', retryError);
          } finally {
            setIsSubmitting(false);
          }
        },
      });
      // Keep modal open on error
    } finally {
      setIsSubmitting(false);
    }
  }, [title, isSubmitting, addQuest, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, title, onClose, handleSubmit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center">
      <div className="bg-black text-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Capture Thought</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">
              Auto-close in {countdown}s
            </span>
            <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="mb-4">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full px-2 py-1 border border-gray-600 rounded text-sm bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Capture'}
          </button>
        </div>

        {/* Hint */}
        <p className="text-xs text-gray-300 mt-2">
          Press Enter to save, Escape to cancel
        </p>
      </div>
    </div>
  );
}
