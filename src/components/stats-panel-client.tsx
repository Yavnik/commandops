'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Activity,
  Target,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';
import { DataErrorBoundary } from '@/components/error-boundary-enhanced';

interface StatsPanelClientProps {
  questStats: {
    activeCount: number;
    completedCount: number;
    planningCount: number;
    archivedCount: number;
    totalCount: number;
  };
  missionStats: {
    activeMissions: number;
    archivedMissions: number;
    totalMissions: number;
  };
  analytics: {
    operationalLoad: number;
    weeklyMomentum: number;
    successRate: number;
    estimateAccuracy: number;
  };
}

function StatsPanelContent({
  questStats,
  missionStats,
  analytics,
}: StatsPanelClientProps) {
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);

  // Calculate display stats from server data (no need to store these, they're just computed values)
  const stats = React.useMemo(() => {
    try {
      return {
        activeQuests: questStats.activeCount,
        completedThisWeek: analytics.weeklyMomentum,
        successRateThisWeek: analytics.successRate,
        estimateAccuracy: analytics.estimateAccuracy,
        activeMissions: missionStats.activeMissions, // Mission stats now available
      };
    } catch (error) {
      console.error('Error calculating stats display data:', error);
      showEnhancedErrorToast(error, {
        context: 'Stats Calculation',
      });
      return {
        activeQuests: 0,
        completedThisWeek: 0,
        successRateThisWeek: 0,
        estimateAccuracy: 0,
        activeMissions: 0,
      };
    }
  }, [questStats, missionStats, analytics]);

  const statCards = React.useMemo(() => {
    try {
      return [
        {
          label: 'Active Quests',
          value: stats.activeQuests,
          icon: Activity,
          color: 'text-accent-text',
          bgColor: 'bg-icon-bg-cyan',
          borderColor: 'border-icon-border-cyan',
        },
        {
          label: 'Completed (This Week)',
          value: stats.completedThisWeek,
          icon: CheckCircle,
          color: 'text-success',
          bgColor: 'bg-icon-bg-green',
          borderColor: 'border-icon-border-green',
        },
        {
          label: 'Success Rate (This Week)',
          value: `${stats.successRateThisWeek}%`,
          icon: TrendingUp,
          color: 'text-success',
          bgColor: 'bg-icon-bg-green',
          borderColor: 'border-icon-border-green',
        },
        {
          label: 'Estimate Accuracy',
          value: `${stats.estimateAccuracy}%`,
          icon: Target,
          color: 'text-accent-text',
          bgColor: 'bg-icon-bg-cyan',
          borderColor: 'border-icon-border-cyan',
        },
      ];
    } catch (error) {
      console.error('Error generating stat cards:', error);
      showEnhancedErrorToast(error, {
        context: 'Stats Display',
      });
      return [];
    }
  }, [stats]);

  const handleStatsToggle = () => {
    try {
      setIsStatsExpanded(!isStatsExpanded);
    } catch (error) {
      console.error('Error toggling stats display:', error);
      showEnhancedErrorToast(error, {
        context: 'Stats Interface',
      });
    }
  };

  return (
    <div className="mb-4 sm:mb-6">
      <h2 className="text-sm text-primary-text uppercase tracking-wider mb-2 sm:mb-3">
        Performance Readout
      </h2>

      {/* Mobile Collapsible Summary */}
      <div className="md:hidden">
        <button
          onClick={handleStatsToggle}
          className="w-full border rounded-lg p-2 sm:p-3 transition-colors"
          style={{
            backgroundColor: 'var(--color-input-bg)',
            borderColor: 'var(--color-input-border)',
            borderRadius: 'var(--border-radius-md, 0.375rem)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor =
              'var(--color-input-border-hover)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--color-input-border)';
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 md:gap-4 text-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <Activity className="h-4 w-4 text-accent-text" />
                <span className="text-secondary-text">Active:</span>
                <span className="text-accent-text font-semibold">
                  {stats.activeQuests}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-secondary-text">Done:</span>
                <span className="text-success font-semibold">
                  {stats.completedThisWeek}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-secondary-text">Success:</span>
                <span className="text-success font-semibold">
                  {stats.successRateThisWeek}%
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              {isStatsExpanded ? (
                <ChevronUp className="h-4 w-4 text-secondary-text" />
              ) : (
                <ChevronDown className="h-4 w-4 text-secondary-text" />
              )}
            </div>
          </div>
        </button>

        {/* Mobile Expanded Stats Grid */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            isStatsExpanded
              ? 'max-h-96 opacity-100 mt-2 sm:mt-3'
              : 'max-h-0 opacity-0'
          )}
        >
          <div className="grid grid-cols-2 gap-2">
            {statCards.map(stat => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.label}
                  className={cn(
                    'border',
                    stat.borderColor,
                    'transition-all hover:shadow-[0_0_20px_var(--color-glow)]/20 mobile-touch-feedback mobile-tap-highlight'
                  )}
                >
                  <CardContent className="p-2 sm:p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-secondary-text uppercase tracking-wider">
                          {stat.label}
                        </p>
                        <p
                          className={cn(
                            'text-lg sm:text-xl font-bold mt-1',
                            stat.color
                          )}
                        >
                          {stat.value}
                        </p>
                      </div>
                      <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                        <Icon className={cn('h-4 w-4', stat.color)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Full Stats Grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map(stat => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className={cn(
                'border',
                stat.borderColor,
                'transition-all hover:shadow-[0_0_20px_var(--color-glow)]/20 mobile-touch-feedback mobile-tap-highlight'
              )}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-secondary-text uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p
                      className={cn(
                        'text-xl sm:text-2xl font-bold mt-1',
                        stat.color
                      )}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn('p-2 sm:p-3 rounded-lg', stat.bgColor)}>
                    <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export const StatsPanelClient = React.memo(function StatsPanelClient({
  questStats,
  missionStats,
  analytics,
}: StatsPanelClientProps) {
  return (
    <DataErrorBoundary context="performance statistics">
      <StatsPanelContent
        questStats={questStats}
        missionStats={missionStats}
        analytics={analytics}
      />
    </DataErrorBoundary>
  );
});
