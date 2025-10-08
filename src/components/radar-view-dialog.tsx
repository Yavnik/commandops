'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Quest } from '@/types';
import { cn } from '@/lib/utils';
import { QuestDetailsModal } from '@/components/quest-details-modal';
import { Radar as RadarIcon, Crosshair } from 'lucide-react';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';
import { DataErrorBoundary } from '@/components/error-boundary-enhanced';

interface RadarViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quests: Quest[];
}

type TimelineView = 'today' | '7days' | '30days';

const RADAR_SIZE = 500;
const RADAR_CENTER = RADAR_SIZE / 2;
const RADAR_RINGS = 4;

function RadarViewContent({
  open,
  onOpenChange,
  quests,
}: RadarViewDialogProps) {
  const [timelineView, setTimelineView] = useState<TimelineView>('today');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [hoveredQuest, setHoveredQuest] = useState<Quest | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [scannerAngle, setScannerAngle] = useState(0);
  const [noisePattern, setNoisePattern] = useState<
    Array<{ x: number; y: number; opacity: number }>
  >([]);

  // Animate scanner rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setScannerAngle(prev => (prev + 2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Generate and animate radar noise
  useEffect(() => {
    try {
      // Generate initial noise pattern
      const generateNoise = () => {
        const noise = [];
        const numDots = 25; // More dots for better radar feel
        for (let i = 0; i < numDots; i++) {
          const angle = Math.random() * 2 * Math.PI;
          const radius = Math.random() * (RADAR_CENTER - 30) + 30; // Keep noise inside radar bounds
          const x = RADAR_CENTER + radius * Math.cos(angle);
          const y = RADAR_CENTER + radius * Math.sin(angle);
          noise.push({
            x,
            y,
            opacity: Math.random() * 0.4 + 0.2, // More visible opacity
          });
        }
        return noise;
      };

      setNoisePattern(generateNoise());

      // Animate noise (flicker effect)
      const noiseInterval = setInterval(() => {
        setNoisePattern(prev =>
          prev.map(dot => ({
            ...dot,
            opacity: Math.random() * 0.5 + 0.15, // More visible flickering
          }))
        );
      }, 150); // Faster flicker for more dynamic feel

      return () => clearInterval(noiseInterval);
    } catch (error) {
      console.error('Error generating radar noise pattern:', error);
      showEnhancedErrorToast(error, {
        context: 'Radar Display',
      });
    }
  }, []);

  // Filter quests by timeline and status
  const filteredQuests = useMemo(() => {
    try {
      const planningQuests = (quests || []).filter(
        quest => quest.status === 'PLANNING'
      );
      const now = new Date();

      return (planningQuests || []).filter(quest => {
        if (!quest.deadline) return timelineView === '30days'; // No deadline quests go to 30 days view

        const deadline = new Date(quest.deadline);
        const diffMs = deadline.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        switch (timelineView) {
          case 'today':
            return diffDays <= 1;
          case '7days':
            return diffDays <= 7;
          case '30days':
            return diffDays <= 30 || diffDays > 30;
          default:
            return true;
        }
      });
    } catch (error) {
      console.error('Error filtering quests for radar view:', error);
      showEnhancedErrorToast(error, {
        context: 'Radar Quest Filtering',
      });
      return [];
    }
  }, [quests, timelineView]);

  // Calculate quest positions on radar
  const questDots = useMemo(() => {
    try {
      const now = new Date();
      const maxTimelineMs =
        timelineView === 'today'
          ? 24 * 60 * 60 * 1000
          : timelineView === '7days'
            ? 7 * 24 * 60 * 60 * 1000
            : 30 * 24 * 60 * 60 * 1000;

      return (filteredQuests || []).map((quest, index) => {
        let distance: number;

        if (!quest.deadline) {
          // No deadline quests go to outer ring
          distance = 0.9;
        } else {
          const deadline = new Date(quest.deadline);
          const diffMs = deadline.getTime() - now.getTime();

          if (diffMs < 0) {
            // Overdue quests at center
            distance = 0.1;
          } else {
            // Map time to distance (closer deadline = closer to center)
            const normalizedTime = Math.min(diffMs / maxTimelineMs, 1);
            distance = 0.15 + normalizedTime * 0.75; // Range from 0.15 to 0.9
          }
        }

        // Random angle for each quest in its ring (adjust for 0° being at top)
        const angle = ((index * 47 + quest.id.charCodeAt(0) * 13) % 360) - 90; // Pseudo-random but consistent, with 0° at top
        const radius = distance * (RADAR_CENTER - 20);

        const x = RADAR_CENTER + radius * Math.cos((angle * Math.PI) / 180);
        const y = RADAR_CENTER + radius * Math.sin((angle * Math.PI) / 180);

        return { quest, x, y, distance, angle };
      });
    } catch (error) {
      console.error('Error calculating quest positions:', error);
      showEnhancedErrorToast(error, {
        context: 'Radar Quest Positioning',
      });
      return [];
    }
  }, [filteredQuests, timelineView]);

  const handleQuestClick = (quest: Quest) => {
    try {
      setSelectedQuest(quest);
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error opening quest details:', error);
      showEnhancedErrorToast(error, {
        context: 'Quest Details',
      });
    }
  };

  const getTimelineBounds = () => {
    switch (timelineView) {
      case 'today':
        return 'Next 24 Hours';
      case '7days':
        return 'Next 7 Days';
      case '30days':
        return 'Next 30 Days';
    }
  };

  const getRangeLabels = () => {
    switch (timelineView) {
      case 'today':
        return ['6H', '12H', '18H', '24H'];
      case '7days':
        return ['2D', '4D', '6D', '7D'];
      case '30days':
        return ['1W', '2W', '3W', '30D'];
      default:
        return ['25%', '50%', '75%', '100%'];
    }
  };

  const getStatsData = () => {
    const total = filteredQuests.length;
    const critical = (filteredQuests || []).filter(q => q.isCritical).length;
    const overdue = (filteredQuests || []).filter(q => {
      if (!q.deadline) return false;
      return new Date(q.deadline) < new Date();
    }).length;

    // Sector analysis - divide into 4 quadrants
    const sectors = { NE: 0, SE: 0, SW: 0, NW: 0 };
    (questDots || []).forEach(({ angle }) => {
      const bearing = (angle + 90 + 360) % 360;
      if (bearing >= 0 && bearing < 90) sectors.NE++;
      else if (bearing >= 90 && bearing < 180) sectors.SE++;
      else if (bearing >= 180 && bearing < 270) sectors.SW++;
      else sectors.NW++;
    });

    const maxSector = Object.entries(sectors).reduce((a, b) =>
      sectors[a[0] as keyof typeof sectors] >
      sectors[b[0] as keyof typeof sectors]
        ? a
        : b
    )[0] as keyof typeof sectors;

    return { total, critical, overdue, sectors, maxSector };
  };

  const stats = getStatsData();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] h-[85vh] lg:h-[70vh] overflow-y-auto border-accent-text/30 bg-background/95 backdrop-blur-sm sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl p-3 sm:p-6 flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 mb-4">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-mono font-bold tracking-wider uppercase text-accent-text flex items-center justify-center gap-2">
                <RadarIcon className="h-6 w-6" />
                TACTICAL RADAR VIEW
              </DialogTitle>
            </DialogHeader>

            {/* Timeline Selector */}
            <div className="flex justify-center mt-4">
              <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-1 flex">
                {(['today', '7days', '30days'] as const).map(view => (
                  <Button
                    key={view}
                    variant={timelineView === view ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTimelineView(view)}
                    className={cn(
                      'font-mono text-xs tracking-wider uppercase',
                      timelineView === view
                        ? 'bg-accent-text/20 text-accent-text border border-accent-text/30'
                        : 'text-gray-400 hover:text-accent-text'
                    )}
                  >
                    {view === 'today'
                      ? 'TODAY'
                      : view === '7days'
                        ? 'NEXT 7 DAYS'
                        : 'NEXT 30 DAYS'}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex lg:flex-row flex-col gap-6 lg:min-h-0">
            {/* Main Radar Display - Takes center stage */}
            <div className="flex-1 flex justify-center items-center px-4 lg:px-0 flex-shrink-0">
              <div className="relative max-w-full">
                <svg
                  width={RADAR_SIZE}
                  height={RADAR_SIZE}
                  className="bg-slate-900/50 border border-slate-600/50 rounded-full w-full max-w-[350px] lg:max-w-full h-auto"
                  viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
                >
                  {/* Radar Rings */}
                  {Array.from({ length: RADAR_RINGS }, (_, i) => {
                    const radius =
                      ((i + 1) / RADAR_RINGS) * (RADAR_CENTER - 20);
                    return (
                      <circle
                        key={i}
                        cx={RADAR_CENTER}
                        cy={RADAR_CENTER}
                        r={radius}
                        fill="none"
                        stroke="rgb(34 197 94 / 0.3)"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    );
                  })}

                  {/* Radar Lines */}
                  {Array.from({ length: 8 }, (_, i) => {
                    const angle = ((i * 45 - 90) * Math.PI) / 180; // Subtract 90° to make 0° point up
                    const x2 =
                      RADAR_CENTER + (RADAR_CENTER - 20) * Math.cos(angle);
                    const y2 =
                      RADAR_CENTER + (RADAR_CENTER - 20) * Math.sin(angle);
                    return (
                      <line
                        key={i}
                        x1={RADAR_CENTER}
                        y1={RADAR_CENTER}
                        x2={x2}
                        y2={y2}
                        stroke="rgb(34 197 94 / 0.2)"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Scanner Beam */}
                  <defs>
                    <linearGradient
                      id="scannerGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="rgb(34 197 94 / 0)" />
                      <stop offset="70%" stopColor="rgb(34 197 94 / 0.3)" />
                      <stop offset="100%" stopColor="rgb(34 197 94 / 0.8)" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M ${RADAR_CENTER} ${RADAR_CENTER} 
                          L ${RADAR_CENTER + (RADAR_CENTER - 20) * Math.cos(((scannerAngle - 90) * Math.PI) / 180)} 
                            ${RADAR_CENTER + (RADAR_CENTER - 20) * Math.sin(((scannerAngle - 90) * Math.PI) / 180)} 
                          A ${RADAR_CENTER - 20} ${RADAR_CENTER - 20} 0 0 1 
                            ${RADAR_CENTER + (RADAR_CENTER - 20) * Math.cos(((scannerAngle - 90 + 30) * Math.PI) / 180)} 
                            ${RADAR_CENTER + (RADAR_CENTER - 20) * Math.sin(((scannerAngle - 90 + 30) * Math.PI) / 180)} Z`}
                    fill="url(#scannerGradient)"
                  />

                  {/* Radar Noise */}
                  {noisePattern.map((dot, index) => (
                    <circle
                      key={`noise-${index}`}
                      cx={dot.x}
                      cy={dot.y}
                      r="0.8"
                      fill="rgb(34 197 94)"
                      opacity={dot.opacity}
                      style={{
                        filter: 'drop-shadow(0 0 1px rgb(34 197 94))',
                      }}
                    />
                  ))}

                  {/* Center Crosshair */}
                  <Crosshair
                    x={RADAR_CENTER - 8}
                    y={RADAR_CENTER - 8}
                    width={16}
                    height={16}
                    className="text-green-400"
                  />

                  {/* Quest Dots */}
                  {(questDots || []).map(({ quest, x, y, angle }) => {
                    // Calculate if scanner is near this quest (within ±30 degrees)
                    const normalizedScannerAngle =
                      (scannerAngle - 90 + 360) % 360;
                    const normalizedQuestAngle = (angle + 360) % 360;
                    const angleDiff = Math.abs(
                      normalizedScannerAngle - normalizedQuestAngle
                    );
                    const minAngleDiff = Math.min(angleDiff, 360 - angleDiff);
                    const isPulsing = minAngleDiff <= 30; // Scanner beam width

                    return (
                      <circle
                        key={quest.id}
                        cx={x}
                        cy={y}
                        r={quest.isCritical ? 6 : 4}
                        fill={
                          quest.deadline &&
                          new Date(quest.deadline) < new Date()
                            ? 'rgb(239 68 68)' // Red for overdue
                            : quest.isCritical
                              ? 'rgb(251 146 60)' // Orange for critical
                              : 'rgb(34 197 94)' // Green for normal
                        }
                        stroke="rgb(255 255 255 / 0.8)"
                        strokeWidth="1"
                        className={`cursor-pointer hover:stroke-white hover:stroke-2 transition-all ${
                          isPulsing ? 'animate-pulse' : ''
                        }`}
                        style={{
                          filter: isPulsing
                            ? 'brightness(1.5) drop-shadow(0 0 8px currentColor)'
                            : 'none',
                        }}
                        onClick={() => handleQuestClick(quest)}
                        onMouseEnter={() => {
                          setHoveredQuest(quest);
                          setTooltipPosition({ x, y });
                        }}
                        onMouseLeave={() => {
                          setHoveredQuest(null);
                          setTooltipPosition(null);
                        }}
                      />
                    );
                  })}

                  {/* Ring Labels */}
                  {Array.from({ length: RADAR_RINGS }, (_, i) => {
                    const radius =
                      ((i + 1) / RADAR_RINGS) * (RADAR_CENTER - 20);
                    const rangeLabels = getRangeLabels();
                    return (
                      <text
                        key={i}
                        x={RADAR_CENTER + radius - 15}
                        y={RADAR_CENTER - 5}
                        fontSize="10"
                        fill="rgb(156 163 175)"
                        className="font-mono"
                      >
                        {rangeLabels[i]}
                      </text>
                    );
                  })}

                  {/* Angle Labels */}
                  {[
                    '0°',
                    '45°',
                    '90°',
                    '135°',
                    '180°',
                    '225°',
                    '270°',
                    '315°',
                  ].map((label, i) => {
                    const angle = i * 45 - 90; // Subtract 90° to make 0° point up
                    const radian = (angle * Math.PI) / 180;
                    const x =
                      RADAR_CENTER + (RADAR_CENTER - 10) * Math.cos(radian);
                    const y =
                      RADAR_CENTER + (RADAR_CENTER - 10) * Math.sin(radian);
                    return (
                      <text
                        key={label}
                        x={x}
                        y={y}
                        fontSize="10"
                        fill="rgb(156 163 175)"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="font-mono"
                      >
                        {label}
                      </text>
                    );
                  })}
                </svg>

                {/* Tooltip */}
                {hoveredQuest && tooltipPosition && (
                  <div
                    className="absolute bg-slate-800/95 border border-slate-600/50 rounded p-3 text-xs font-mono max-w-xs z-20 pointer-events-none shadow-lg backdrop-blur-sm"
                    style={{
                      left: `${tooltipPosition.x}px`,
                      bottom: `${RADAR_SIZE - tooltipPosition.y + 15}px`,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className="text-accent-text font-bold mb-1 tracking-wider uppercase">
                      {hoveredQuest.title}
                    </div>
                    {hoveredQuest.deadline && (
                      <div className="text-gray-300 mb-1">
                        <div>
                          📅{' '}
                          {new Date(hoveredQuest.deadline).toLocaleDateString()}
                        </div>
                        <div>
                          🕒{' '}
                          {new Date(hoveredQuest.deadline).toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            }
                          )}{' '}
                          ZULU
                        </div>
                      </div>
                    )}
                    {!hoveredQuest.deadline && (
                      <div className="text-gray-400 mb-1">📅 NO DEADLINE</div>
                    )}
                    <div className="text-gray-400 text-xs mb-1">
                      🧭 BEARING:{' '}
                      {Math.round(
                        (((questDots || []).find(
                          dot => dot.quest.id === hoveredQuest.id
                        )?.angle || 0) +
                          90 +
                          360) %
                          360
                      )
                        .toString()
                        .padStart(3, '0')}
                      °
                    </div>
                    <div
                      className={cn(
                        'text-xs font-bold tracking-wider',
                        hoveredQuest.deadline &&
                          new Date(hoveredQuest.deadline) < new Date()
                          ? 'text-red-400'
                          : hoveredQuest.isCritical
                            ? 'text-orange-400'
                            : 'text-green-400'
                      )}
                    >
                      {hoveredQuest.deadline &&
                      new Date(hoveredQuest.deadline) < new Date()
                        ? '🔴 OVERDUE'
                        : hoveredQuest.isCritical
                          ? '🟠 CRITICAL'
                          : '🟢 STANDARD'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Legend and Stats */}
            <div className="w-full lg:w-80 xl:w-72 space-y-4 flex-shrink-0">
              {/* Legend Card */}
              <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4">
                <h3 className="text-sm font-mono font-bold text-accent-text mb-3 tracking-wider uppercase">
                  LEGEND
                </h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-300">Standard Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-gray-300">Critical Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-300">Overdue</span>
                  </div>
                  <div className="border-t border-slate-600/30 pt-2 mt-2">
                    <div className="text-gray-400 text-xs">
                      Distance from center indicates deadline proximity
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4">
                <h3 className="text-sm font-mono font-bold text-accent-text mb-3 tracking-wider uppercase">
                  TACTICAL STATS
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-mono">
                      TOTAL CONTACTS
                    </span>
                    <span className="text-sm font-mono font-bold text-cyan-400">
                      {stats.total}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-mono">
                      CRITICAL
                    </span>
                    <span className="text-sm font-mono font-bold text-orange-400">
                      {stats.critical}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-mono">
                      OVERDUE
                    </span>
                    <span className="text-sm font-mono font-bold text-red-400">
                      {stats.overdue}
                    </span>
                  </div>
                  <div className="border-t border-slate-600/30 pt-2">
                    <div className="text-xs text-gray-400 font-mono mb-1">
                      SCOPE: {getTimelineBounds()}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      HOT SECTOR: {stats.maxSector} (
                      {stats.sectors[stats.maxSector]} CONTACTS)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quest Details Modal */}
      <QuestDetailsModal
        quest={selectedQuest}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  );
}

export function RadarViewDialog({
  open,
  onOpenChange,
  quests,
}: RadarViewDialogProps) {
  return (
    <DataErrorBoundary context="radar view">
      <RadarViewContent
        open={open}
        onOpenChange={onOpenChange}
        quests={quests}
      />
    </DataErrorBoundary>
  );
}
