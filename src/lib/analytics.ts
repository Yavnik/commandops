export interface Analytics {
  operationalLoad: number; // 0-1 fraction of active quests / 3 (max capacity)
  weeklyMomentum: number; // Count of quests completed in last 7 days
  successRate: number; // Percentage of on-time completions in last 30 days
  estimateAccuracy: number; // Percentage accuracy of time estimates
}

/**
 * Simple analytics updater for optimistic client updates
 * No complex filtering - just simple increment/decrement operations
 */
export class AnalyticsUpdater {
  private analytics: Analytics;

  constructor(initialAnalytics: Analytics) {
    this.analytics = { ...initialAnalytics };
  }

  // Update operational load when quest status changes
  updateOperationalLoad(change: 1 | -1): Analytics {
    const currentActive = Math.round(this.analytics.operationalLoad * 3);
    const newActive = Math.max(0, currentActive + change);
    this.analytics.operationalLoad = Math.min(newActive / 3, 1);
    return { ...this.analytics };
  }

  // Update weekly momentum when quest is completed
  updateWeeklyMomentum(change: 1 | -1): Analytics {
    this.analytics.weeklyMomentum = Math.max(
      0,
      this.analytics.weeklyMomentum + change
    );
    return { ...this.analytics };
  }

  // Get current analytics
  getAnalytics(): Analytics {
    return { ...this.analytics };
  }

  // Reset to server analytics (on revalidation)
  reset(serverAnalytics: Analytics): Analytics {
    this.analytics = { ...serverAnalytics };
    return { ...this.analytics };
  }
}

/**
 * Get analytics display formatting
 */
export function formatAnalytics(analytics: Analytics) {
  return {
    operationalLoad: {
      value: analytics.operationalLoad,
      display: `${Math.round(analytics.operationalLoad * 3)} / 3`,
      percentage: Math.round(analytics.operationalLoad * 100),
    },
    weeklyMomentum: {
      value: analytics.weeklyMomentum,
      display: analytics.weeklyMomentum.toString(),
    },
    successRate: {
      value: analytics.successRate,
      display: `${analytics.successRate}%`,
    },
    estimateAccuracy: {
      value: analytics.estimateAccuracy,
      display: `${analytics.estimateAccuracy}%`,
    },
  };
}

/**
 * Get analytics status indicators based on values
 */
export function getAnalyticsStatus(analytics: Analytics) {
  return {
    operationalLoad:
      analytics.operationalLoad >= 1
        ? 'danger'
        : analytics.operationalLoad >= 0.67
          ? 'warning'
          : 'good',
    weeklyMomentum:
      analytics.weeklyMomentum >= 5
        ? 'good'
        : analytics.weeklyMomentum >= 2
          ? 'warning'
          : 'danger',
    successRate:
      analytics.successRate >= 80
        ? 'good'
        : analytics.successRate >= 60
          ? 'warning'
          : 'danger',
    estimateAccuracy:
      analytics.estimateAccuracy >= 80
        ? 'good'
        : analytics.estimateAccuracy >= 60
          ? 'warning'
          : 'danger',
  };
}

/**
 * Performance measurement utility for analytics calculations
 */
export function measureAnalyticsPerformance<T>(
  operation: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  // Log performance in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${operation}: ${duration.toFixed(2)}ms`);
  }

  return result;
}
