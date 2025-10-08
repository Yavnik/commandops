'use client';

import { useState } from 'react';
import { Quest } from '@/types';
import { Target, Clock, Infinity, X } from 'lucide-react';

interface TimerSelectionModalProps {
  quest: Quest;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTimer: (
    timerType: 'pomodoro' | 'countdown' | 'open-ended',
    duration: number
  ) => void;
}

export function TimerSelectionModal({
  quest,
  isOpen,
  onClose,
  onUpdateTimer,
}: TimerSelectionModalProps) {
  const [selectedType, setSelectedType] = useState<
    'pomodoro' | 'countdown' | 'open-ended'
  >('pomodoro');
  const [customDuration, setCustomDuration] = useState(25);

  const getDefaultCountdownDuration = () => {
    if (quest.estimatedTime) {
      return quest.estimatedTime;
    }
    if (quest.deadline) {
      const now = new Date();
      const deadline = new Date(quest.deadline);
      const hoursUntilDeadline = Math.ceil(
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
      );
      return Math.max(15, Math.min(hoursUntilDeadline * 60, 120)); // Between 15 min and 2 hours
    }
    return 30;
  };

  const [countdownDuration, setCountdownDuration] = useState(
    getDefaultCountdownDuration()
  );

  const handleStart = () => {
    let duration: number;

    if (selectedType === 'pomodoro') {
      duration = customDuration;
    } else if (selectedType === 'countdown') {
      duration = countdownDuration;
    } else {
      // Default fallback duration
      duration = 25; // 25 minutes default
    }

    onUpdateTimer(selectedType, duration);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-black text-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Select Timer Mode</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Quest Info */}
        <div className="mb-6 p-3 bg-gray-800 rounded-lg border border-gray-600">
          <h3 className="font-semibold text-white mb-1">{quest.title}</h3>
          {quest.description && (
            <p className="text-sm text-gray-300">{quest.description}</p>
          )}
        </div>

        {/* Timer Options */}
        <div className="space-y-3 mb-6">
          {/* Pomodoro */}
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              selectedType === 'pomodoro'
                ? 'border-blue-500 bg-blue-900/30'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onClick={() => setSelectedType('pomodoro')}
          >
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <h4 className="font-medium text-white">Pomodoro</h4>
                <p className="text-sm text-gray-300">Focused work session</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={customDuration}
                  onChange={e => setCustomDuration(Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-gray-600 rounded text-sm bg-gray-800 text-white"
                  min="5"
                  max="120"
                  disabled={selectedType !== 'pomodoro'}
                />
                <span className="text-sm text-gray-300">min</span>
              </div>
            </div>
          </div>

          {/* Countdown */}
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              selectedType === 'countdown'
                ? 'border-orange-500 bg-orange-900/30'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onClick={() => setSelectedType('countdown')}
          >
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-orange-400" />
              <div className="flex-1">
                <h4 className="font-medium text-white">Countdown</h4>
                <p className="text-sm text-gray-300">
                  {quest.estimatedTime
                    ? `Based on estimate (${quest.estimatedTime} min)`
                    : quest.deadline
                      ? 'Based on deadline'
                      : 'Custom duration'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={countdownDuration}
                  onChange={e => setCountdownDuration(Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-gray-600 rounded text-sm bg-gray-800 text-white"
                  min="5"
                  max="480"
                  disabled={selectedType !== 'countdown'}
                />
                <span className="text-sm text-gray-300">min</span>
              </div>
            </div>
          </div>

          {/* Open-ended */}
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              selectedType === 'open-ended'
                ? 'border-green-500 bg-green-900/30'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onClick={() => setSelectedType('open-ended')}
          >
            <div className="flex items-center space-x-3">
              <Infinity className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <h4 className="font-medium text-white">Open-ended</h4>
                <p className="text-sm text-gray-300">
                  Work until you&apos;re done
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Battle Station
          </button>
        </div>
      </div>
    </div>
  );
}
