'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getMissionsForFilter, searchMissions } from '@/lib/queries/missions';
import { getMissionsWithArchivedQuestsAction } from '@/app/actions/archive';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';

interface SearchableMissionSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  useArchiveMissions?: boolean;
  selectedMissionTitle?: string;
}

interface MissionOption {
  id: string;
  title: string;
}

// Special options that are always available
const SPECIAL_OPTIONS = [
  { id: 'all', title: 'All Missions' },
  { id: 'standalone', title: 'Standalone' },
] as const;

export function SearchableMissionSelector({
  value,
  onValueChange,
  className,
  useArchiveMissions = false,
  selectedMissionTitle,
}: SearchableMissionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [missions, setMissions] = useState<MissionOption[]>([]);
  const [searchResults, setSearchResults] = useState<MissionOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadMissions = useCallback(async () => {
    setIsLoading(true);
    try {
      if (useArchiveMissions) {
        const result = await getMissionsWithArchivedQuestsAction();
        setMissions(result);
      } else {
        const result = await getMissionsForFilter();
        setMissions(result.missions);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to load missions:', error);
      showEnhancedErrorToast(error, {
        context: 'Mission Loading',
        onRetry: () => loadMissions(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [useArchiveMissions]);

  const performSearch = useCallback((query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't search for queries with less than 3 characters
    if (query.trim().length < 3) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    // Only set loading state if we're actually going to perform a search
    setIsLoading(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const result = await searchMissions(query);
        setSearchResults(result.missions);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
        showEnhancedErrorToast(error, {
          context: 'Mission Search',
          onRetry: () => performSearch(query),
        });
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  // Initialize missions when popover opens
  useEffect(() => {
    if (isOpen && !isInitialized) {
      loadMissions();
    }
  }, [isOpen, isInitialized, loadMissions]);

  // Search when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, performSearch]);

  // Get missions to display
  const displayMissions = useMemo(() => {
    return searchQuery.trim().length >= 3 ? searchResults : missions;
  }, [searchQuery, searchResults, missions]);

  // Get selected mission display text
  const selectedText = useMemo(() => {
    if (!value || value === 'all') return 'All Missions';
    if (value === 'standalone') return 'Standalone';

    // If we have a pre-provided title for the selected mission, use it immediately
    if (value && selectedMissionTitle) {
      return selectedMissionTitle;
    }
    // TODO: This is buggy, selectedMission should be an object with id and title
    const selectedMission =
      missions.find(m => m.id === value) ||
      searchResults.find(m => m.id === value);
    return selectedMission?.title || 'Mission';
  }, [value, missions, searchResults, selectedMissionTitle]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      setSearchQuery('');
      setSearchResults([]);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue === 'all' ? '' : selectedValue);
    handleOpenChange(false);
  };

  const renderMissionOption = (option: { id: string; title: string }) => {
    const isSelected = value === option.id || (option.id === 'all' && !value);

    return (
      <div
        key={option.id}
        className={cn(
          'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
          isSelected && 'bg-accent'
        )}
        onClick={() => handleSelect(option.id)}
      >
        <Check
          className={cn(
            'mr-2 h-4 w-4',
            isSelected ? 'opacity-100' : 'opacity-0'
          )}
        />
        <span className="truncate">{option.title}</span>
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn(
            // Match Input/SelectTrigger styling exactly
            'flex min-h-[44px] w-full items-center justify-between border px-3 py-2 text-sm ring-offset-background focus:outline-hidden focus:ring-2 focus:ring-accent-text focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all',
            'min-w-[120px] max-w-[200px] w-auto h-9', // Responsive width classes and consistent height
            className
          )}
          style={{
            borderColor: 'var(--color-input-border)',
            backgroundColor: 'var(--color-input-bg)',
            color: 'var(--color-input-text)',
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
          <span className="truncate">{selectedText}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0 backdrop-blur-md"
        align="start"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-primary-text)',
          borderRadius: 'var(--border-radius-md, 0.375rem)',
          boxShadow: 'var(--color-dialog-shadow, 0 0 20px var(--color-glow))',
        }}
      >
        <div className="p-2">
          <Input
            placeholder="Search missions..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="h-8"
            autoFocus
          />
        </div>
        <div className="max-h-[200px] overflow-auto">
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                {!isInitialized ? 'Loading...' : 'Searching...'}
              </span>
            </div>
          )}

          {/* Results */}
          {!isLoading && (
            <>
              {/* Special options always at top */}
              {SPECIAL_OPTIONS.map(option => renderMissionOption(option))}

              {/* Divider if we have missions */}
              {displayMissions.length > 0 && (
                <div className="border-t mx-2 my-1" />
              )}

              {/* Mission options */}
              {displayMissions.map(mission => renderMissionOption(mission))}

              {/* No results message */}
              {searchQuery.trim() && displayMissions.length === 0 && (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No missions found
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
