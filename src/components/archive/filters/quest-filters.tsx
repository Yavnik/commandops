'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useArchiveStore } from '@/store/archive-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchableMissionSelector } from '@/components/ui/searchable-mission-selector';
import { DateRangeSelector } from '../date-range-selector';
import {
  satisfactionEmojis,
  getSatisfactionDisplay,
} from '@/types/satisfaction';

export const QuestFilters: React.FC = () => {
  const {
    questFilters,
    setQuestFilters,
    clearQuestFilters,
    applyQuestFilters,
    isLoading,
    selectedMissionTitle,
    setSelectedMissionTitle,
  } = useArchiveStore();

  // Track applied filters to detect changes
  const [appliedFilters, setAppliedFilters] = useState(questFilters);

  // Sync applied filters when filters are reset externally
  useEffect(() => {
    // If all filters match defaults, sync the applied state
    const isDefaultState =
      JSON.stringify(questFilters) ===
      JSON.stringify({
        searchQuery: '',
        dateRange: { startDate: null, endDate: null },
        missionIds: [],
        satisfactionLevels: [],
        showCriticalOnly: false,
      });

    if (
      isDefaultState &&
      JSON.stringify(appliedFilters) !== JSON.stringify(questFilters)
    ) {
      setAppliedFilters({ ...questFilters });
    }
  }, [questFilters, appliedFilters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestFilters({ searchQuery: e.target.value });
  };

  const handleDateChange = (
    startDate: Date | undefined,
    endDate: Date | undefined
  ) => {
    setQuestFilters({
      dateRange: {
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
      },
    });
  };

  const handleSatisfactionChange = (satisfaction: string) => {
    if (satisfaction === 'all' || satisfaction === '') {
      setQuestFilters({ satisfactionLevels: [] });
    } else {
      const level = parseInt(satisfaction);
      if (satisfaction === 'frustrated') {
        setQuestFilters({ satisfactionLevels: [1, 2] });
      } else if (satisfaction === 'standard') {
        setQuestFilters({ satisfactionLevels: [3] });
      } else if (satisfaction === 'smooth') {
        setQuestFilters({ satisfactionLevels: [4, 5] });
      } else {
        setQuestFilters({ satisfactionLevels: [level] });
      }
    }
  };

  const handleCriticalToggle = (checked: boolean) => {
    setQuestFilters({ showCriticalOnly: checked });
  };

  const handleApply = () => {
    applyQuestFilters();
    setAppliedFilters({ ...questFilters });
  };

  const handleClear = () => {
    clearQuestFilters();
    setAppliedFilters({ ...questFilters });
  };

  const getCurrentSatisfactionValue = () => {
    const levels = questFilters.satisfactionLevels;
    if (levels.length === 0) return '';
    if (levels.length === 2 && levels.includes(1) && levels.includes(2))
      return 'frustrated';
    if (levels.length === 1 && levels.includes(3)) return 'standard';
    if (levels.length === 2 && levels.includes(4) && levels.includes(5))
      return 'smooth';
    return levels[0]?.toString() || '';
  };

  const getSelectedMissionsText = () => {
    const count = questFilters.missionIds.length;
    if (count === 0) return 'All Missions';
    if (count === 1) {
      if (questFilters.missionIds[0] === 'standalone') {
        return 'Standalone';
      }
      return 'Mission';
    }
    return 'Mission';
  };

  // Check if current filters differ from applied filters
  const hasUnappliedChanges = () => {
    return JSON.stringify(questFilters) !== JSON.stringify(appliedFilters);
  };

  return (
    <Card className="p-3 w-full">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative min-w-[200px] max-w-[280px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quests..."
            value={questFilters.searchQuery}
            onChange={handleSearchChange}
            className="pl-10 h-9"
          />
        </div>

        {/* Date Range Selector */}
        <DateRangeSelector
          key={`${questFilters.dateRange.startDate}-${questFilters.dateRange.endDate}`}
          startDate={
            questFilters.dateRange.startDate
              ? new Date(questFilters.dateRange.startDate)
              : undefined
          }
          endDate={
            questFilters.dateRange.endDate
              ? new Date(questFilters.dateRange.endDate)
              : undefined
          }
          onDateChange={handleDateChange}
          className="h-9"
          align="start"
        />

        {/* Mission Selection */}
        <SearchableMissionSelector
          value={
            questFilters.missionIds.length === 1
              ? questFilters.missionIds[0]
              : ''
          }
          onValueChange={value => {
            if (value === '' || value === 'all') {
              setQuestFilters({ missionIds: [] });
            } else if (value === 'standalone') {
              setQuestFilters({ missionIds: ['standalone'] });
            } else {
              setQuestFilters({ missionIds: [value] });
            }
            // Clear the stored mission title when user manually changes selection
            // (it will be repopulated from the mission list)
            setSelectedMissionTitle(null);
          }}
          placeholder={getSelectedMissionsText()}
          className="h-9"
          useArchiveMissions={true}
          selectedMissionTitle={selectedMissionTitle || undefined}
        />

        {/* Satisfaction Filter */}
        <Select
          value={getCurrentSatisfactionValue()}
          onValueChange={handleSatisfactionChange}
        >
          <SelectTrigger className="w-auto min-w-[120px] h-9">
            <SelectValue placeholder="Satisfaction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {satisfactionEmojis.map(satisfaction => (
              <SelectItem
                key={satisfaction.value}
                value={satisfaction.value.toString()}
              >
                {getSatisfactionDisplay(satisfaction.value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Critical Type Toggle */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="critical-type"
            checked={questFilters.showCriticalOnly}
            onCheckedChange={handleCriticalToggle}
            className="h-4 w-4"
          />
          <Label
            htmlFor="critical-type"
            className="text-sm whitespace-nowrap cursor-pointer"
          >
            Critical Only
          </Label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 ml-auto">
          <Button
            onClick={handleApply}
            size="sm"
            className={`h-9 ${hasUnappliedChanges() ? 'bg-accent hover:bg-accent/90' : ''}`}
            disabled={isLoading.quests}
          >
            {isLoading.quests ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin"></div>
                <span>Applying...</span>
              </div>
            ) : hasUnappliedChanges() ? (
              'Apply*'
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
