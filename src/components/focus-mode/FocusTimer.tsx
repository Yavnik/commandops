'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { posthogCapture } from '@/lib/posthog-utils';

interface FocusTimerProps {
  timerType: 'pomodoro' | 'countdown' | 'open-ended';
  duration: number | null; // in minutes
}

export function FocusTimer({ timerType, duration }: FocusTimerProps) {
  const [isRunning, setIsRunning] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0); // in seconds
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [pausedAt, setPausedAt] = useState<Date | null>(null);
  const [totalPausedTime, setTotalPausedTime] = useState(0); // in seconds
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Reset timer when mode or duration changes
  useEffect(() => {
    const now = new Date();
    setTimerStartTime(now);
    setTimeElapsed(0);
    setTotalPausedTime(0);
    setPausedAt(null);
    setIsRunning(true);
    setSessionCompleted(false);

    // Set initial time remaining
    if (timerType === 'pomodoro') {
      const totalSeconds = (duration || 25) * 60;
      setTimeRemaining(totalSeconds);
    } else if (timerType === 'countdown' && duration) {
      const totalSeconds = duration * 60;
      setTimeRemaining(totalSeconds);
    } else {
      setTimeRemaining(0);
    }

    // Track focus session start
    posthogCapture('focus_session_started', {
      timer_type: timerType,
      duration_minutes: duration,
      session_start_time: now.toISOString(),
    });
  }, [timerType, duration]);

  useEffect(() => {
    if (!timerStartTime) return;

    const updateTimer = () => {
      if (!isRunning) return;

      const now = new Date();
      const elapsed =
        Math.floor((now.getTime() - timerStartTime.getTime()) / 1000) -
        totalPausedTime;
      setTimeElapsed(elapsed);

      if (timerType === 'pomodoro') {
        const totalSeconds = (duration || 25) * 60;
        const remaining = Math.max(0, totalSeconds - elapsed);
        setTimeRemaining(remaining);
        if (remaining === 0) setIsRunning(false);
      } else if (timerType === 'countdown' && duration) {
        const totalSeconds = duration * 60;
        const remaining = Math.max(0, totalSeconds - elapsed);
        setTimeRemaining(remaining);
        if (remaining === 0) setIsRunning(false);
      }
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [timerStartTime, timerType, duration, isRunning, totalPausedTime]);

  // Handle pause/resume logic
  useEffect(() => {
    if (!isRunning && !pausedAt) {
      setPausedAt(new Date());
    } else if (isRunning && pausedAt) {
      const pauseDuration = Math.floor(
        (new Date().getTime() - pausedAt.getTime()) / 1000
      );
      setTotalPausedTime(prev => prev + pauseDuration);
      setPausedAt(null);
    }
  }, [isRunning, pausedAt]);

  // Track timer completion
  useEffect(() => {
    if (
      (timerType === 'pomodoro' || timerType === 'countdown') &&
      timeRemaining === 0 &&
      timeElapsed > 0 &&
      !sessionCompleted
    ) {
      posthogCapture('focus_session_completed', {
        timer_type: timerType,
        duration_minutes: duration,
        elapsed_seconds: timeElapsed,
        total_paused_seconds: totalPausedTime,
        completion_time: new Date().toISOString(),
      });
      setSessionCompleted(true);
    }
  }, [timeRemaining, timerType, duration, timeElapsed, totalPausedTime, sessionCompleted]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    const wasRunning = isRunning;
    setIsRunning(!isRunning);

    // Track pause/resume events
    posthogCapture(
      wasRunning ? 'focus_session_paused' : 'focus_session_resumed',
      {
        timer_type: timerType,
        duration_minutes: duration,
        elapsed_seconds: timeElapsed,
        total_paused_seconds: totalPausedTime,
      }
    );
  };

  const resetTimer = () => {
    // Track reset event with session data
    posthogCapture('focus_session_reset', {
      timer_type: timerType,
      duration_minutes: duration,
      elapsed_seconds: timeElapsed,
      total_paused_seconds: totalPausedTime,
      completion_percentage: duration
        ? Math.round((timeElapsed / (duration * 60)) * 100)
        : null,
    });

    const now = new Date();
    setTimerStartTime(now);
    setIsRunning(true);
    setTimeElapsed(0);
    setTotalPausedTime(0);
    setPausedAt(null);
    setSessionCompleted(false);

    // Reset time remaining based on current timer type
    if (timerType === 'pomodoro') {
      setTimeRemaining((duration || 25) * 60);
    } else if (timerType === 'countdown' && duration) {
      setTimeRemaining(duration * 60);
    } else {
      setTimeRemaining(0);
    }
  };

  const renderTimerDisplay = () => {
    switch (timerType) {
      case 'pomodoro':
        return (
          <div className="text-center">
            <div className="text-6xl md:text-8xl font-mono font-bold text-white mb-4">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xl text-white/70">Pomodoro Session</div>
            {timeRemaining === 0 && (
              <div className="text-lg text-green-400 mt-2">
                Session Complete!
              </div>
            )}
          </div>
        );

      case 'countdown':
        return (
          <div className="text-center">
            <div className="text-6xl md:text-8xl font-mono font-bold text-white mb-4">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xl text-white/70">Countdown Timer</div>
            {timeRemaining === 0 && (
              <div className="text-lg text-green-400 mt-2">Time&apos;s Up!</div>
            )}
          </div>
        );

      case 'open-ended':
        return (
          <div className="text-center">
            <div className="text-6xl md:text-8xl font-mono font-bold text-white mb-4">
              {formatTime(timeElapsed)}
            </div>
            <div className="text-xl text-white/70">Open Session</div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {renderTimerDisplay()}

      {/* Timer Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTimer}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          title={isRunning ? 'Pause' : 'Resume'}
        >
          {isRunning ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white" />
          )}
        </button>

        <button
          onClick={resetTimer}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          title="Reset Timer"
        >
          <RotateCcw className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
