'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { useArchiveStore } from '@/store/archive-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DateRangeSelector } from '../date-range-selector';

export const MissionFilters: React.FC = () => {
  const {
    missionFilters,
    setMissionFilters,
    clearMissionFilters,
    applyMissionFilters,
    isLoading,
  } = useArchiveStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMissionFilters({ searchQuery: e.target.value });
  };

  const handleDateChange = (
    startDate: Date | undefined,
    endDate: Date | undefined
  ) => {
    setMissionFilters({
      archivedDateRange: {
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
      },
    });
  };

  const handleApply = () => {
    applyMissionFilters();
  };

  const handleClear = () => {
    clearMissionFilters();
  };

  return (
    <Card className="p-3 w-full">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative min-w-[200px] max-w-[320px] flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search missions by title or objective..."
            value={missionFilters.searchQuery}
            onChange={handleSearchChange}
            className="pl-10 h-9"
          />
        </div>

        {/* Archived Date Range Selector */}
        <DateRangeSelector
          key={`${missionFilters.archivedDateRange.startDate}-${missionFilters.archivedDateRange.endDate}`}
          startDate={
            missionFilters.archivedDateRange.startDate
              ? new Date(missionFilters.archivedDateRange.startDate)
              : undefined
          }
          endDate={
            missionFilters.archivedDateRange.endDate
              ? new Date(missionFilters.archivedDateRange.endDate)
              : undefined
          }
          onDateChange={handleDateChange}
          className="h-9"
          align="start"
        />

        {/* Action Buttons */}
        <div className="flex gap-2 ml-auto">
          <Button
            onClick={handleApply}
            size="sm"
            className="h-9"
            disabled={isLoading.missions}
          >
            {isLoading.missions ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin"></div>
                <span>Applying...</span>
              </div>
            ) : (
              'Apply'
            )}
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            size="sm"
            className="h-9"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
