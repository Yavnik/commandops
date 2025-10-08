'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { MissionDetails } from '@/types/archive';
import { Archive, Calendar, Target, TrendingUp, Clock } from 'lucide-react';

interface MissionAfterActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission: MissionDetails | null;
  isLoading?: boolean;
}

export const MissionAfterActionModal = React.memo(
  function MissionAfterActionModal({
    open,
    onOpenChange,
    mission,
    isLoading = false,
  }: MissionAfterActionModalProps) {
    if (!mission && !isLoading) {
      return null;
    }

    const formatSatisfactionDisplay = (avgSatisfaction: number | null) => {
      if (!avgSatisfaction)
        return { emoji: '—', label: 'Not rated', value: '—' };

      let emoji, label;
      if (avgSatisfaction <= 2) {
        emoji = '🔥';
        label = 'Frustrating';
      } else if (avgSatisfaction === 3) {
        emoji = '😐';
        label = 'Standard';
      } else {
        emoji = '🚀';
        label = 'Smooth';
      }

      return { emoji, label, value: `${avgSatisfaction.toFixed(1)}/5` };
    };

    const formatTime = (minutes: number | null) => {
      if (!minutes) return '—';
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (hours > 0) {
        return `${hours}h ${mins}m`;
      }
      return `${mins}m`;
    };

    const satisfactionDisplay = mission
      ? formatSatisfactionDisplay(mission.avgSatisfaction)
      : null;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Archive className="h-6 w-6 text-primary-accent" />
              Mission After-Action Report
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-6 bg-tabs-border rounded w-3/4"></div>
              <div className="h-4 bg-tabs-border rounded w-1/2"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-tabs-border rounded"></div>
                ))}
              </div>
              <div className="h-32 bg-tabs-border rounded"></div>
            </div>
          ) : mission ? (
            <div className="space-y-6">
              {/* Mission Overview */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary-text mb-2 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary-accent" />
                    Mission Overview
                  </h3>
                  <div className="bg-tabs-bg/50 rounded-lg p-4 space-y-3">
                    <div>
                      <h4 className="text-xl font-bold text-primary-text">
                        {mission.title}
                      </h4>
                      {mission.objective && (
                        <p className="text-secondary-text mt-1">
                          {mission.objective}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary-accent" />
                        <span className="text-secondary-text">Archived:</span>
                        <span className="text-primary-text font-medium">
                          {mission.archivedAt
                            ? format(
                                new Date(mission.archivedAt),
                                'MMM dd, yyyy'
                              )
                            : '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Archive className="h-4 w-4 text-green-400" />
                        <span className="text-secondary-text">Status:</span>
                        <Badge
                          variant="secondary"
                          className="bg-green-400/10 text-green-400 border-green-400/30"
                        >
                          Archived
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mission Statistics */}
              <div>
                <h3 className="text-lg font-semibold text-primary-text mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary-accent" />
                  Mission Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-tabs-bg/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary-text">
                      {mission.questCount}
                    </div>
                    <div className="text-sm text-secondary-text">
                      Total Quests
                    </div>
                  </div>
                  <div className="bg-tabs-bg/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">
                      100%
                    </div>
                    <div className="text-sm text-secondary-text">
                      Completion Rate
                    </div>
                  </div>
                  <div className="bg-tabs-bg/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary-text flex items-center gap-1">
                      <Clock className="h-5 w-5" />
                      {formatTime(mission.totalTime ?? null)}
                    </div>
                    <div className="text-sm text-secondary-text">
                      Total Time
                    </div>
                  </div>
                  <div className="bg-tabs-bg/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary-text flex items-center gap-1">
                      {satisfactionDisplay?.emoji}
                      <span className="text-base">
                        {satisfactionDisplay?.value}
                      </span>
                    </div>
                    <div className="text-sm text-secondary-text">
                      Avg Satisfaction
                    </div>
                  </div>
                </div>
              </div>

              {/* After Action Report */}
              {mission.afterActionReport && (
                <div>
                  <h3 className="text-lg font-semibold text-primary-text mb-3">
                    After Action Report
                  </h3>
                  <div className="bg-tabs-bg/50 rounded-lg p-4">
                    <p className="text-secondary-text whitespace-pre-wrap">
                      {mission.afterActionReport}
                    </p>
                  </div>
                </div>
              )}

              {/* Show message if no after action report */}
              {!mission.afterActionReport && (
                <div className="bg-tabs-bg/50 rounded-lg p-8 text-center">
                  <p className="text-secondary-text">
                    No after action report available for this mission.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    );
  }
);
