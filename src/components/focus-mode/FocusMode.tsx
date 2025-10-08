'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Quest } from '@/types';
import { X, Target, Clock, Infinity, Settings, Music } from 'lucide-react';
import { FocusTimer } from './FocusTimer';
import { InterruptCapture } from './InterruptCapture';
import { TimerSelectionModal } from './TimerSelectionModal';
import { useBackgroundMusic } from '@/hooks/use-background-music';

interface FocusModeProps {
  quest: Quest;
}

export function FocusMode({ quest }: FocusModeProps) {
  const router = useRouter();
  const [showInterruptCapture, setShowInterruptCapture] = useState(false);
  const [showTimerSelection, setShowTimerSelection] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const { isPlaying, isLoading, toggleMusic } = useBackgroundMusic();

  // Local focus mode state
  const [timerType, setTimerType] = useState<
    'pomodoro' | 'countdown' | 'open-ended'
  >('pomodoro');
  const [timerDuration, setTimerDuration] = useState<number>(25);

  // Handle navigation warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return '';
    };

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      setShowExitConfirmation(true);
      // Push the current state back to prevent navigation
      window.history.pushState(null, '', window.location.pathname);
    };

    // Add browser beforeunload event
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Add popstate listener for back button
    window.addEventListener('popstate', handlePopState);

    // Push initial state to handle back button
    window.history.pushState(null, '', window.location.pathname);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Handle escape key to show exit confirmation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowExitConfirmation(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExit = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  const handleInterruptCapture = () => {
    setShowInterruptCapture(true);
  };

  const getTimerIcon = () => {
    switch (timerType) {
      case 'pomodoro':
        return <Target className="w-4 h-4" />;
      case 'countdown':
        return <Clock className="w-4 h-4" />;
      case 'open-ended':
        return <Infinity className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center">
      {/* Quest Title */}
      <div className="text-center mb-12 max-w-4xl px-8">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
          {quest.title}
        </h1>
        {quest.description && (
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            {quest.description}
          </p>
        )}
      </div>

      {/* Timer */}
      <div className="mb-12">
        <FocusTimer timerType={timerType} duration={timerDuration} />
      </div>

      {/* Timer Mode Selection */}
      <div className="mb-8">
        <button
          onClick={() => setShowTimerSelection(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          {getTimerIcon()}
          <span className="text-sm capitalize">{timerType} Mode</span>
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* First Tactical Step */}
      {quest.firstTacticalStep && (
        <div className="mb-8 max-w-md text-center">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm text-white/70 mb-2">First Tactical Step:</p>
            <p className="text-white">{quest.firstTacticalStep}</p>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
        {/* Music Button */}
        <button
          onClick={toggleMusic}
          disabled={isLoading}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm text-white/70 hover:text-white/90 flex items-center space-x-2"
          title={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Music
              className={`w-4 h-4 ${isPlaying ? 'animate-[spin_3s_linear_infinite]' : ''}`}
            />
          )}
          <span>Music</span>
        </button>

        {/* Interrupt Capture Button */}
        <button
          onClick={handleInterruptCapture}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm text-white/70 hover:text-white/90"
        >
          Capture Thought
        </button>

        {/* Exit Button */}
        <button
          onClick={() => setShowExitConfirmation(true)}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm text-white/70 hover:text-white/90 flex items-center space-x-1"
          title="Exit Battle Station (ESC)"
        >
          <X className="w-4 h-4" />
          <span>Exit</span>
        </button>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirmation && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center">
          <div className="bg-black text-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-600">
            <h2 className="text-xl font-bold mb-4">Exit Battle Station?</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to exit your focus session? Your progress
              will be lost.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowExitConfirmation(false)}
                className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interrupt Capture Modal */}
      {showInterruptCapture && (
        <InterruptCapture
          isOpen={showInterruptCapture}
          onClose={() => setShowInterruptCapture(false)}
        />
      )}

      {/* Timer Selection Modal */}
      {showTimerSelection && (
        <TimerSelectionModal
          quest={quest}
          isOpen={showTimerSelection}
          onClose={() => setShowTimerSelection(false)}
          onUpdateTimer={(newTimerType, newDuration) => {
            setTimerType(newTimerType);
            setTimerDuration(newDuration);
            setShowTimerSelection(false);
          }}
        />
      )}
    </div>
  );
}
