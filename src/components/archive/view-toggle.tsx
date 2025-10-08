'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useArchiveStore } from '@/store/archive-store';
import { useRouter, useSearchParams } from 'next/navigation';
import { Swords, Briefcase } from 'lucide-react';

export const ViewToggle = React.memo(function ViewToggle() {
  const { currentView, setCurrentView } = useArchiveStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleViewChange = (view: 'quests' | 'missions') => {
    setCurrentView(view);

    // Update URL params
    const params = new URLSearchParams(searchParams);
    params.set('view', view);

    // Clear other view-specific params when switching views
    if (view === 'quests') {
      params.delete('archivedStartDate');
      params.delete('archivedEndDate');
      params.delete('minQuests');
      params.delete('maxQuests');
    } else {
      params.delete('startDate');
      params.delete('endDate');
      params.delete('missions');
      params.delete('satisfaction');
      params.delete('critical');
    }

    // Reset pagination when switching views
    params.delete('page');

    router.push(`/archive?${params.toString()}`);
  };

  return (
    <div className="mb-4 sm:mb-6">
      <Tabs
        value={currentView}
        onValueChange={value =>
          handleViewChange(value as 'quests' | 'missions')
        }
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="quests" className="flex items-center gap-2">
            <Swords className="h-4 w-4" />
            <span className="hidden sm:inline">Archived</span>
            Quests
          </TabsTrigger>
          <TabsTrigger value="missions" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Archived</span>
            Missions
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
});
