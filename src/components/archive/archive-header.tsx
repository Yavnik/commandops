'use client';

import React from 'react';
import { Archive } from 'lucide-react';

interface ArchiveHeaderProps {
  totalCount: number;
  viewMode: 'quests' | 'missions';
}

export const ArchiveHeader = React.memo(function ArchiveHeader({
  totalCount,
  viewMode,
}: ArchiveHeaderProps) {
  const getViewLabel = () => {
    return viewMode === 'quests' ? 'Archived Quests' : 'Archived Missions';
  };

  const getViewDescription = () => {
    return viewMode === 'quests'
      ? 'Historical quest analysis and operational lookup'
      : 'Campaign-level analysis and mission history';
  };

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 rounded-lg bg-icon-bg-cyan border border-icon-border-cyan">
            <Archive className="h-4 w-4 sm:h-5 sm:w-5 text-accent-text" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-primary-text uppercase tracking-wider">
              MISSION LOG
            </h1>
            <p className="text-xs sm:text-sm text-secondary-text cscz-archive-description">
              {getViewDescription()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-secondary-text cscz-archive-total">
          <span className="hidden sm:inline">Total:</span>
          <span className="font-semibold text-accent-text">
            {totalCount.toLocaleString()}
          </span>
          <span className="hidden sm:inline lowercase">{viewMode}</span>
        </div>
      </div>

      <div className="text-xs text-secondary-text uppercase tracking-wider">
        {getViewLabel()}
      </div>
    </div>
  );
});
