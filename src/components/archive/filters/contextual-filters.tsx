'use client';

import React from 'react';
import { useArchiveStore } from '@/store/archive-store';
import { QuestFilters } from './quest-filters';
import { MissionFilters } from './mission-filters';

export const ContextualFilters: React.FC = () => {
  const { currentView } = useArchiveStore();

  return (
    <div className="w-full">
      {currentView === 'quests' ? <QuestFilters /> : <MissionFilters />}
    </div>
  );
};
