'use client';

import { Mission } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  MoreVertical,
  Activity,
  Target,
  Eye,
  Edit,
  Trash2,
  Archive,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';

interface MissionCardProps {
  mission: Mission;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onViewQuests?: () => void;
}

export function MissionCard({
  mission,
  onClick,
  onEdit,
  onDelete,
  onArchive,
  onViewQuests,
}: MissionCardProps) {
  // Use direct counts from mission object for optimal performance
  const completed = mission.completedQuestCount;
  const total = mission.totalQuestCount;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const progress = { completed, total, percentage };

  // Calculate if mission can be archived
  const pendingQuests = total - completed;
  const canArchive = pendingQuests === 0;

  return (
    <Card
      className="group relative overflow-hidden border-blue-500/20 bg-black/40 backdrop-blur-sm transition-all hover:border-blue-500/40 hover:bg-black/60 cursor-pointer flex flex-col"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 sm:pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base sm:text-lg font-bold text-blue-100">
            {mission.title}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-gray-400">
            Mission ID: {mission.id.slice(0, 8).toUpperCase()}
          </CardDescription>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onViewQuests?.();
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Quests
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onEdit?.();
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Mission
            </DropdownMenuItem>
            <TooltipWrapper
              disabled={canArchive}
              side="right"
              delayDuration={0}
              content={
                <div className="flex items-start space-x-2 max-w-50 sm:max-w-xs">
                  <Archive className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Cannot Archive Mission</p>
                    <p className="text-xs text-gray-300 mt-1">
                      There are {pendingQuests} pending quest
                      {pendingQuests !== 1 ? 's' : ''} which need
                      {pendingQuests === 1 ? 's' : ''} to be completed before
                      archiving this mission.
                    </p>
                  </div>
                </div>
              }
            >
              <div>
                <DropdownMenuItem
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (canArchive) {
                      onArchive?.();
                    }
                  }}
                  disabled={!canArchive}
                  className={!canArchive ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Mission
                </DropdownMenuItem>
              </div>
            </TooltipWrapper>
            <DropdownMenuItem
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="text-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Mission
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        <div>
          {mission.objective && (
            <p className="text-sm text-gray-300 line-clamp-2">
              {mission.objective}
            </p>
          )}
        </div>

        <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Target className="h-4 w-4" />
              <span>
                {progress.completed}/{progress.total} Quests
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Activity className="h-4 w-4" />
              <span className="text-blue-400">{progress.percentage}%</span>
            </div>
          </div>

          <Progress value={progress.percentage} className="h-2 bg-gray-800" />

          <div className="pt-1 sm:pt-2 text-xs text-gray-500 border-t border-gray-800">
            Created {format(mission.createdAt, 'MMM d, yyyy')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
