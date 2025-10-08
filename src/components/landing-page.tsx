'use client';

import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Target, CheckCircle2, Sword, Zap as Lightning } from 'lucide-react';
import { SystemStatus } from '@/components/system-status';
import { LiveTime } from '@/components/live-time';

// Lazy load non-critical components
const SystemStatusBar = dynamic(
  () =>
    import('@/components/system-status-bar').then(mod => ({
      default: mod.SystemStatusBar,
    })),
  {
    ssr: false,
    loading: () => <div className="h-16 bg-slate-900/50 animate-pulse" />,
  }
);

const ThemeSelector = dynamic(
  () =>
    import('@/components/theme-selector').then(mod => ({
      default: mod.ThemeSelector,
    })),
  {
    ssr: false,
  }
);

// Lazy load heavy icons
const LazyMonitor = dynamic(
  () => import('lucide-react').then(mod => ({ default: mod.Monitor })),
  { ssr: false }
);
const LazyMoon = dynamic(
  () => import('lucide-react').then(mod => ({ default: mod.Moon })),
  { ssr: false }
);
const LazyBarChart3 = dynamic(
  () => import('lucide-react').then(mod => ({ default: mod.BarChart3 })),
  { ssr: false }
);
const LazyFocus = dynamic(
  () => import('lucide-react').then(mod => ({ default: mod.Focus })),
  { ssr: false }
);
const LazyPlay = dynamic(
  () => import('lucide-react').then(mod => ({ default: mod.Play })),
  { ssr: false }
);
const LazyPause = dynamic(
  () => import('lucide-react').then(mod => ({ default: mod.Pause })),
  { ssr: false }
);
const LazyRotateCcw = dynamic(
  () => import('lucide-react').then(mod => ({ default: mod.RotateCcw })),
  { ssr: false }
);
const LazyStar = dynamic(
  () => import('lucide-react').then(mod => ({ default: mod.Star })),
  { ssr: false }
);
const LazyActivity = dynamic(
  () => import('lucide-react').then(mod => ({ default: mod.Activity })),
  { ssr: false }
);
const LazyCheckCircle = dynamic(
  () => import('lucide-react').then(mod => ({ default: mod.CheckCircle })),
  { ssr: false }
);
const LazyXCircle = dynamic(
  () => import('lucide-react').then(mod => ({ default: mod.XCircle })),
  { ssr: false }
);

// Loading skeleton component
const LoadingSkeleton = memo(({ className }: { className?: string }) => (
  <div className={`bg-slate-700/30 rounded animate-pulse ${className}`} />
));
LoadingSkeleton.displayName = 'LoadingSkeleton';

const LandingPageComponent = memo(() => {
  const router = useRouter();
  const [timerTime, setTimerTime] = useState(1500); // 25 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showSystemBar, setShowSystemBar] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set(['hero'])); // Hero always visible

  // Show system bar after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSystemBar(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Intersection observer for lazy loading sections
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            setVisibleSections(prev => new Set([...prev, sectionId]));
          }
        });
      },
      {
        rootMargin: '100px', // Load 100px before entering viewport
        threshold: 0.1,
      }
    );

    // Observe all sections
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning && timerTime > 0) {
      interval = setInterval(() => {
        setTimerTime(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 1500; // Reset to 25 minutes
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, timerTime]);

  const toggleTimer = useCallback(() => {
    setIsTimerRunning(!isTimerRunning);
  }, [isTimerRunning]);

  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setTimerTime(1500);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }, []);

  const handleSignin = useCallback(() => {
    router.push('/signin');
  }, [router]);

  const screenshots = useMemo(
    () => [
      {
        title: 'Command Dashboard',
        description:
          'Your mission control center with real-time operational intelligence',
        placeholder: '/screenshot-1.jpeg',
        alt: 'Command Ops dashboard showing the three-column Kanban board with Planning Zone, Active Operations, and Mission Complete sections, featuring real-time metrics and ADHD-friendly visual design',
      },
      {
        title: 'Active Operations',
        description:
          'Focus mode and active quest management for deep work sessions',
        placeholder: '/screenshot-2.jpeg',
        alt: 'Active Operations interface displaying three concurrent tasks with Battle Station focus mode, featuring Pomodoro timer and task progress indicators',
      },
      {
        title: 'Mission Control',
        description:
          'Strategic overview of all your active missions and objectives',
        placeholder: '/screenshot-3.jpeg',
        alt: 'Mission Control strategic overview showing multiple active missions with critical quest counts and visual priority indicators in sci-fi themed interface',
      },
    ],
    []
  );

  // Remove loading state - no auth check needed

  return (
    <div className="landing-page relative z-10">
      {showSystemBar && <SystemStatusBar />}

      {/* Hero Section - THE HOOK */}
      <section className="min-h-screen w-full flex items-center justify-center px-4 pt-20">
        <div className="flex items-center justify-center w-full">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Side - Minimal Text */}
              <div className="text-center lg:text-left order-1 lg:order-1">
                <div className="bg-[var(--color-landing-backdrop)] rounded-lg p-8">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    COMMAND OPS
                  </h1>
                  <h2
                    className="text-xl md:text-2xl mb-6"
                    style={{ color: 'var(--color-accent-text)' }}
                  >
                    Executive Function Support System
                  </h2>
                  <p
                    className="text-base md:text-lg mb-8 max-w-lg"
                    style={{ color: 'var(--color-secondary-text)' }}
                  >
                    Not a to-do list. A high-performance fighter jet for your
                    productivity.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                    <Button
                      size="lg"
                      onClick={handleSignin}
                      className="min-w-[240px] text-lg py-6"
                    >
                      <Sword className="mr-2 h-6 w-6" />
                      TAKE COMMAND
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <span
                      className="text-sm font-mono font-semibold tracking-wide"
                      style={{ color: 'var(--color-accent-text)' }}
                    >
                      THEME:
                    </span>
                    {visibleSections.has('hero') ? (
                      <ThemeSelector />
                    ) : (
                      <div className="w-32 h-9 bg-slate-700/50 rounded animate-pulse" />
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side - Large Command Deck Visual */}
              <div className="order-2 lg:order-2">
                <div
                  className="relative rounded-lg p-4 border"
                  style={{
                    backgroundColor: 'var(--color-secondary)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="text-left">
                    <div className="flex items-center justify-between mb-6">
                      <h3
                        className="text-lg font-mono"
                        style={{ color: 'var(--color-accent-text)' }}
                      >
                        COMMAND DECK
                      </h3>
                      <SystemStatus size="sm" />
                    </div>

                    <div className="flex gap-4 mb-6 overflow-x-auto sm:overflow-x-visible">
                      {/* Planning Column */}
                      <div className="flex-1 min-w-[200px] sm:min-w-0">
                        <div className="mb-2 sm:mb-3 flex items-center justify-between">
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-200">
                            Planning Zone
                          </h4>
                          <span className="text-xs text-gray-500">4</span>
                        </div>
                        <div className="space-y-2 p-2 rounded-lg bg-gray-900/30 border border-gray-800 min-h-[120px] sm:min-h-[140px]">
                          <div className="rounded-lg border-2 border-gray-700 bg-gray-900/50 p-2 sm:p-3 cursor-pointer hover:bg-gray-800/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                            <div className="font-semibold text-gray-100 text-xs mb-1">
                              Launch side project
                            </div>
                            <div className="text-xs text-gray-500">
                              Due tomorrow
                            </div>
                          </div>
                          <div className="rounded-lg border-2 border-gray-700 bg-gray-900/50 p-2 sm:p-3 cursor-pointer hover:bg-gray-800/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                            <div className="font-semibold text-gray-100 text-xs mb-1">
                              Prepare presentation
                            </div>
                            <div className="text-xs text-gray-500">~60m</div>
                          </div>
                          <div className="rounded-lg border-2 border-yellow-500 bg-yellow-500/10 p-3 relative cursor-pointer hover:bg-yellow-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg animate-pulse">
                            <div className="absolute -top-1 -right-1 rounded-full p-1 bg-yellow-500/20 border border-gray-800">
                              <LazyStar className="h-2 w-2 text-yellow-500 fill-yellow-500" />
                            </div>
                            <div className="font-semibold text-gray-100 text-xs mb-1">
                              CRITICAL: Client deadline
                            </div>
                            <div className="text-xs text-yellow-400 font-medium">
                              Due today • ~45m
                            </div>
                          </div>
                          <div className="rounded-lg border-2 border-gray-700 bg-gray-900/50 p-2 sm:p-3 cursor-pointer hover:bg-gray-800/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                            <div className="font-semibold text-gray-100 text-xs mb-1">
                              Learn new skill
                            </div>
                            <div className="text-xs text-gray-500">~30m</div>
                          </div>
                        </div>
                      </div>

                      {/* Active Column */}
                      <div className="flex-1 min-w-[200px] sm:min-w-0">
                        <div className="mb-2 sm:mb-3 flex items-center justify-between">
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-200">
                            Active Ops
                          </h4>
                          <span className="text-xs text-red-400 font-medium">
                            3/3 CAPACITY
                          </span>
                        </div>
                        <div className="space-y-2 p-2 rounded-lg bg-gray-900/30 border border-gray-800 min-h-[120px] sm:min-h-[140px]">
                          <div className="rounded-lg border-2 border-orange-500 bg-orange-500/10 p-3 relative cursor-pointer hover:bg-orange-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                            <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                            <div className="font-semibold text-gray-100 text-xs mb-1">
                              Deep work: Write proposal
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">25:00 focus</span>
                              <button className="px-2 py-1 rounded bg-red-500/30 text-red-300 font-medium text-xs hover:bg-red-500/40 transition-colors">
                                BATTLE STATION
                              </button>
                            </div>
                          </div>
                          <div className="rounded-lg border-2 border-gray-700 bg-gray-900/50 p-2 sm:p-3 cursor-pointer hover:bg-gray-800/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                            <div className="font-semibold text-gray-100 text-xs mb-1">
                              Team meeting prep
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">~15m</span>
                              <div className="px-2 py-1 rounded bg-green-500/20 text-green-400 font-medium">
                                ACTIVE
                              </div>
                            </div>
                          </div>
                          <div className="rounded-lg border-2 border-gray-700 bg-gray-900/50 p-2 sm:p-3 cursor-pointer hover:bg-gray-800/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                            <div className="font-semibold text-gray-100 text-xs mb-1">
                              Code review tasks
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">~30m</span>
                              <div className="px-2 py-1 rounded bg-green-500/20 text-green-400 font-medium">
                                ACTIVE
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Completed Column */}
                      <div className="flex-1 min-w-[200px] sm:min-w-0">
                        <div className="mb-2 sm:mb-3 flex items-center justify-between">
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-200">
                            Mission Complete
                          </h4>
                          <span className="text-xs text-gray-500">3</span>
                        </div>
                        <div className="space-y-2 p-2 rounded-lg bg-gray-900/30 border border-gray-800 min-h-[120px] sm:min-h-[140px]">
                          <div className="rounded-lg border-2 border-gray-600 bg-gray-800/50 p-3 cursor-pointer hover:bg-gray-700/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg opacity-75">
                            <div className="font-semibold text-gray-300 text-xs mb-1 line-through">
                              Shipped new feature
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">
                                Est: 90m • Actual: 75m
                              </span>
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-400" />
                                <span className="text-green-400 font-medium">
                                  ✓
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-lg border-2 border-gray-600 bg-gray-800/50 p-3 cursor-pointer hover:bg-gray-700/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg opacity-75">
                            <div className="font-semibold text-gray-300 text-xs mb-1 line-through">
                              Aced the interview
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">
                                Satisfaction: 9/10
                              </span>
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-400" />
                                <span className="text-green-400 font-medium">
                                  ✓
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-lg border-2 border-gray-600 bg-gray-800/50 p-3 cursor-pointer hover:bg-gray-700/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg opacity-75">
                            <div className="font-semibold text-gray-300 text-xs mb-1 line-through">
                              Finished online course
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">
                                2-day streak
                              </span>
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-400" />
                                <span className="text-green-400 font-medium">
                                  ✓
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <div
                        onClick={handleSignin}
                        className="px-6 py-3 rounded-lg font-mono text-sm cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg relative overflow-hidden group"
                        style={{
                          backgroundColor: 'var(--color-button-default-bg)',
                          color: 'var(--color-button-default-text)',
                          border:
                            '1px solid var(--color-button-default-border)',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <div className="relative flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          <span>START YOUR FIRST MISSION</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - Scannable Icons */}
      <section className="py-16 px-4" data-section id="problem">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[var(--color-landing-backdrop)] rounded-lg p-8 text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Four Productivity Killers
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Task Paralysis */}
            <div className="text-center group cursor-pointer">
              <div className="relative mb-4">
                <div className="text-6xl mb-2 transition-transform group-hover:scale-110 duration-200">
                  😰
                </div>
              </div>
              <h3
                className="font-bold text-lg mb-2"
                style={{ color: 'var(--color-danger)' }}
              >
                Task Paralysis
              </h3>
              <p
                className="text-sm"
                style={{ color: 'var(--color-secondary-text)' }}
              >
                Can&apos;t start
              </p>
            </div>

            {/* Overwhelm */}
            <div className="text-center group cursor-pointer">
              <div className="relative mb-4">
                <div className="text-6xl mb-2 transition-transform group-hover:scale-110 duration-200">
                  🏔️
                </div>
              </div>
              <h3
                className="font-bold text-lg mb-2"
                style={{ color: 'var(--color-danger)' }}
              >
                Overwhelm
              </h3>
              <p
                className="text-sm"
                style={{ color: 'var(--color-secondary-text)' }}
              >
                Too much to do
              </p>
            </div>

            {/* Time Blindness */}
            <div className="text-center group cursor-pointer">
              <div className="relative mb-4">
                <div className="text-6xl mb-2 transition-transform group-hover:scale-110 duration-200">
                  ⏰
                </div>
              </div>
              <h3
                className="font-bold text-lg mb-2"
                style={{ color: 'var(--color-danger)' }}
              >
                Time Blindness
              </h3>
              <p
                className="text-sm"
                style={{ color: 'var(--color-secondary-text)' }}
              >
                Bad estimates
              </p>
            </div>

            {/* Urgent Chaos */}
            <div className="text-center group cursor-pointer">
              <div className="relative mb-4">
                <div className="text-6xl mb-2 transition-transform group-hover:scale-110 duration-200">
                  🔥
                </div>
              </div>
              <h3
                className="font-bold text-lg mb-2"
                style={{ color: 'var(--color-danger)' }}
              >
                Urgent Chaos
              </h3>
              <p
                className="text-sm"
                style={{ color: 'var(--color-secondary-text)' }}
              >
                Always reactive
              </p>
            </div>
          </div>

          <div className="bg-[var(--color-landing-backdrop)] rounded-lg p-6 text-center mt-12">
            <p
              className="text-lg font-medium"
              style={{ color: 'var(--color-accent-text)' }}
            >
              Sound familiar? You&apos;re not broken. You need better systems.
            </p>
          </div>
        </div>
      </section>

      {/* Theme Showcase Section - Live Previews */}
      <section className="py-16 px-4" data-section id="themes">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[var(--color-landing-backdrop)] rounded-lg p-8 text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Choose Your Tactical Interface
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Default Theme */}
            <div className="group cursor-pointer">
              <div
                className="relative overflow-hidden rounded-lg border-2 p-4 transition-all duration-200 hover:scale-102"
                style={{
                  borderColor: '#06b6d4',
                  backgroundColor: '#0f172a',
                }}
              >
                <div className="absolute top-2 right-2 z-10">
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono"
                    style={{
                      backgroundColor: '#06b6d4',
                      color: '#0f172a',
                    }}
                  >
                    {visibleSections.has('themes') ? (
                      <LazyMonitor className="w-3 h-3" />
                    ) : (
                      <div className="w-3 h-3 bg-cyan-500 rounded" />
                    )}
                    <span>DEFAULT</span>
                  </div>
                </div>
                <div className="mini-command-deck">
                  <div
                    className="text-xs font-mono mb-2"
                    style={{ color: '#06b6d4' }}
                  >
                    COMMAND DECK
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div
                      className="p-2 rounded border-l-2"
                      style={{
                        backgroundColor: '#1e293b',
                        borderLeftColor: '#06b6d4',
                      }}
                    >
                      <div
                        className="font-mono text-xs mb-1"
                        style={{ color: '#06b6d4' }}
                      >
                        PLAN
                      </div>
                      <div
                        className="rounded p-1 mb-1"
                        style={{ backgroundColor: '#334155', color: '#cbd5e1' }}
                      >
                        Task 1
                      </div>
                      <div
                        className="rounded p-1"
                        style={{ backgroundColor: '#334155', color: '#cbd5e1' }}
                      >
                        Task 2
                      </div>
                    </div>
                    <div
                      className="p-2 rounded border-l-2"
                      style={{
                        backgroundColor: '#1e293b',
                        borderLeftColor: '#f97316',
                      }}
                    >
                      <div
                        className="font-mono text-xs mb-1"
                        style={{ color: '#06b6d4' }}
                      >
                        ACTIVE
                      </div>
                      <div
                        className="border rounded p-1"
                        style={{
                          backgroundColor: '#7c2d12',
                          borderColor: '#f97316',
                          color: '#fdba74',
                        }}
                      >
                        Focus
                      </div>
                    </div>
                    <div
                      className="p-2 rounded border-l-2"
                      style={{
                        backgroundColor: '#1e293b',
                        borderLeftColor: '#22c55e',
                      }}
                    >
                      <div
                        className="font-mono text-xs mb-1"
                        style={{ color: '#06b6d4' }}
                      >
                        DONE
                      </div>
                      <div
                        className="border rounded p-1"
                        style={{
                          backgroundColor: '#14532d',
                          borderColor: '#22c55e',
                          color: '#86efac',
                        }}
                      >
                        Complete
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <h3 className="font-semibold text-lg mb-2">Default</h3>
                <p className="text-sm text-slate-400">
                  Futuristic cyan interface
                </p>
              </div>
            </div>

            {/* Night Ops Theme */}
            <div className="group cursor-pointer">
              <div
                className="relative overflow-hidden rounded-lg border-2 p-4 transition-all duration-200 hover:scale-102"
                style={{
                  borderColor: '#64ffda',
                  backgroundColor: '#0d0f12',
                }}
              >
                <div className="absolute top-2 right-2 z-10">
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono"
                    style={{
                      backgroundColor: '#64ffda',
                      color: '#0d0f12',
                    }}
                  >
                    {visibleSections.has('themes') ? (
                      <LazyMoon className="w-3 h-3" />
                    ) : (
                      <div className="w-3 h-3 bg-cyan-500 rounded" />
                    )}
                    <span>NIGHT OPS</span>
                  </div>
                </div>
                <div className="mini-command-deck">
                  <div
                    className="text-xs font-mono mb-2"
                    style={{ color: '#64ffda' }}
                  >
                    COMMAND DECK
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div
                      className="p-2 rounded border-l-2"
                      style={{
                        backgroundColor: '#1a1c20',
                        borderLeftColor: '#a0a0a0',
                      }}
                    >
                      <div
                        className="font-mono text-xs mb-1"
                        style={{ color: '#ffffff' }}
                      >
                        PLAN
                      </div>
                      <div
                        className="rounded p-1 mb-1"
                        style={{ backgroundColor: '#333333', color: '#eaeaea' }}
                      >
                        Task 1
                      </div>
                      <div
                        className="rounded p-1"
                        style={{ backgroundColor: '#333333', color: '#eaeaea' }}
                      >
                        Task 2
                      </div>
                    </div>
                    <div
                      className="p-2 rounded border-l-2"
                      style={{
                        backgroundColor: '#1a1c20',
                        borderLeftColor: '#ffffff',
                      }}
                    >
                      <div
                        className="font-mono text-xs mb-1"
                        style={{ color: '#ffffff' }}
                      >
                        ACTIVE
                      </div>
                      <div
                        className="border rounded p-1"
                        style={{
                          backgroundColor: 'rgba(255, 215, 0, 0.1)',
                          borderColor: '#ffd700',
                          color: '#ffd700',
                        }}
                      >
                        Focus
                      </div>
                    </div>
                    <div
                      className="p-2 rounded border-l-2"
                      style={{
                        backgroundColor: '#1a1c20',
                        borderLeftColor: '#33ff99',
                      }}
                    >
                      <div
                        className="font-mono text-xs mb-1"
                        style={{ color: '#ffffff' }}
                      >
                        DONE
                      </div>
                      <div
                        className="border rounded p-1"
                        style={{
                          backgroundColor: 'rgba(51, 255, 153, 0.1)',
                          borderColor: '#33ff99',
                          color: '#33ff99',
                        }}
                      >
                        Complete
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <h3 className="font-semibold text-lg mb-2">Night Ops</h3>
                <p className="text-sm text-slate-400">
                  Tactical dark operations
                </p>
              </div>
            </div>

            {/* CS:CZ Theme */}
            <div className="group cursor-pointer">
              <div
                className="relative overflow-hidden rounded-lg border-2 p-4 transition-all duration-200 hover:scale-102"
                style={{
                  borderColor: '#c4b550',
                  backgroundColor: '#4c5b44',
                }}
              >
                <div className="absolute top-2 right-2 z-10">
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono"
                    style={{
                      backgroundColor: '#c4b550',
                      color: '#4c5b44',
                    }}
                  >
                    <Target className="w-3 h-3" />
                    <span>CS:CZ</span>
                  </div>
                </div>
                <div className="mini-command-deck">
                  <div
                    className="text-xs font-mono mb-2"
                    style={{ color: '#c4b550' }}
                  >
                    COMMAND DECK
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div
                      className="p-2 rounded border-l-2"
                      style={{
                        backgroundColor: '#3c4532',
                        borderLeftColor: '#7f8c7f',
                      }}
                    >
                      <div
                        className="font-mono text-xs mb-1"
                        style={{ color: '#c4b550' }}
                      >
                        PLAN
                      </div>
                      <div
                        className="rounded p-1 mb-1"
                        style={{ backgroundColor: '#5a6349', color: '#d8ded3' }}
                      >
                        Task 1
                      </div>
                      <div
                        className="rounded p-1"
                        style={{ backgroundColor: '#5a6349', color: '#d8ded3' }}
                      >
                        Task 2
                      </div>
                    </div>
                    <div
                      className="p-2 rounded border-l-2"
                      style={{
                        backgroundColor: '#3c4532',
                        borderLeftColor: '#c4b550',
                      }}
                    >
                      <div
                        className="font-mono text-xs mb-1"
                        style={{ color: '#c4b550' }}
                      >
                        ACTIVE
                      </div>
                      <div
                        className="border rounded p-1"
                        style={{
                          backgroundColor: 'rgba(196, 181, 80, 0.1)',
                          borderColor: '#c4b550',
                          color: '#c4b550',
                        }}
                      >
                        Focus
                      </div>
                    </div>
                    <div
                      className="p-2 rounded border-l-2"
                      style={{
                        backgroundColor: '#3c4532',
                        borderLeftColor: '#9ccc65',
                      }}
                    >
                      <div
                        className="font-mono text-xs mb-1"
                        style={{ color: '#c4b550' }}
                      >
                        DONE
                      </div>
                      <div
                        className="border rounded p-1"
                        style={{
                          backgroundColor: 'rgba(156, 204, 101, 0.1)',
                          borderColor: '#9ccc65',
                          color: '#9ccc65',
                        }}
                      >
                        Complete
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <h3 className="font-semibold text-lg mb-2">CS:CZ</h3>
                <p className="text-sm text-slate-400">Retro military gaming</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your New Arsenal Section - Enhanced */}
      <section className="py-16 px-4" data-section id="arsenal">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[var(--color-landing-backdrop)] rounded-lg p-8 text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Your New Arsenal
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--color-secondary-text)' }}
            >
              Three weapons. Four problems solved.
            </p>
          </div>

          <div className="space-y-16">
            {/* Operations Board */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-icon-bg-cyan)',
                      border: '1px solid var(--color-icon-border-cyan)',
                    }}
                  >
                    <Target
                      className="h-8 w-8"
                      style={{ color: 'var(--color-accent-text)' }}
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Operations Board
                    </h3>
                    <p
                      className="text-base"
                      style={{ color: 'var(--color-secondary-text)' }}
                    >
                      Pristine cockpit. See only what matters now.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span className="text-sm">
                      3-quest active limit prevents overwhelm
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span className="text-sm">
                      Visual priority system shows what&apos;s critical
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span className="text-sm">
                      Clean interface reduces decision fatigue
                    </span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div
                  className="rounded-lg p-6 border h-80 flex flex-col"
                  style={{
                    backgroundColor: 'var(--color-secondary)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div
                    className="text-sm font-mono mb-4"
                    style={{ color: 'var(--color-accent-text)' }}
                  >
                    OPERATIONS METRICS
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-1">
                    <Card className="border border-icon-border-cyan transition-all hover:shadow-[0_0_20px_var(--color-glow)]/20">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-secondary-text uppercase tracking-wider">
                              Active Quests
                            </p>
                            <p className="text-xl sm:text-2xl font-bold mt-1 text-accent-text">
                              42
                            </p>
                          </div>
                          <div className="p-2 sm:p-3 rounded-lg bg-icon-bg-cyan">
                            {visibleSections.has('arsenal') ? (
                              <LazyActivity className="h-4 w-4 sm:h-5 sm:w-5 text-accent-text" />
                            ) : (
                              <div className="h-4 w-4 sm:h-5 sm:w-5 bg-cyan-500/20 rounded animate-pulse" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border border-icon-border-green transition-all hover:shadow-[0_0_20px_var(--color-glow)]/20">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-secondary-text uppercase tracking-wider">
                              Completed (This Week)
                            </p>
                            <p className="text-xl sm:text-2xl font-bold mt-1 text-success">
                              127
                            </p>
                          </div>
                          <div className="p-2 sm:p-3 rounded-lg bg-icon-bg-green">
                            {visibleSections.has('arsenal') ? (
                              <LazyCheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                            ) : (
                              <div className="h-4 w-4 sm:h-5 sm:w-5 bg-green-500/20 rounded animate-pulse" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border border-icon-border-cyan transition-all hover:shadow-[0_0_20px_var(--color-glow)]/20">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-secondary-text uppercase tracking-wider">
                              Success Rate (This Week)
                            </p>
                            <p className="text-xl sm:text-2xl font-bold mt-1 text-accent-text">
                              94%
                            </p>
                          </div>
                          <div className="p-2 sm:p-3 rounded-lg bg-icon-bg-cyan">
                            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-accent-text" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border border-icon-border-red transition-all hover:shadow-[0_0_20px_var(--color-glow)]/20">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-secondary-text uppercase tracking-wider">
                              Failed (This Week)
                            </p>
                            <p className="text-xl sm:text-2xl font-bold mt-1 text-danger">
                              8
                            </p>
                          </div>
                          <div className="p-2 sm:p-3 rounded-lg bg-icon-bg-red">
                            {visibleSections.has('arsenal') ? (
                              <LazyXCircle className="h-4 w-4 sm:h-5 sm:w-5 text-danger" />
                            ) : (
                              <div className="h-4 w-4 sm:h-5 sm:w-5 bg-red-500/20 rounded animate-pulse" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>

            {/* Battle Station */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="order-2">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-icon-bg-cyan)',
                      border: '1px solid var(--color-icon-border-cyan)',
                    }}
                  >
                    {visibleSections.has('arsenal') ? (
                      <LazyFocus
                        className="h-8 w-8"
                        style={{ color: 'var(--color-accent-text)' }}
                      />
                    ) : (
                      <div className="h-8 w-8 bg-cyan-500/20 rounded animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Battle Station</h3>
                    <p
                      className="text-base"
                      style={{ color: 'var(--color-secondary-text)' }}
                    >
                      Eliminate all distractions. Pure focus.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span className="text-sm">
                      Full-screen focus mode blocks everything
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span className="text-sm">
                      Pomodoro timer keeps you on track
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span className="text-sm">
                      Interrupt capture for random thoughts
                    </span>
                  </div>
                </div>
              </div>
              <div className="order-1">
                <div
                  className="rounded-lg p-6 border h-80 flex flex-col items-center justify-center bg-black text-white"
                  style={{
                    borderColor: '#333333',
                  }}
                >
                  <div className="text-center">
                    <div className="text-xl font-bold mb-4 text-white">
                      BATTLE STATION {isTimerRunning ? 'ACTIVE' : 'STANDBY'}
                    </div>
                    <div className="text-5xl font-mono mb-4 text-white">
                      {formatTime(timerTime)}
                    </div>
                    <div className="text-sm mb-6 text-white/70">
                      Fix critical authentication bug
                    </div>

                    <div className="flex items-center justify-center gap-4 mb-6">
                      <button
                        onClick={toggleTimer}
                        className="p-3 rounded-lg transition-all duration-200 hover:scale-105 bg-white/10 hover:bg-white/20 border border-white/20"
                      >
                        {isTimerRunning ? (
                          <LazyPause className="w-6 h-6 text-white" />
                        ) : (
                          <LazyPlay className="w-6 h-6 text-white" />
                        )}
                      </button>
                      <button
                        onClick={resetTimer}
                        className="p-3 rounded-lg transition-all duration-200 hover:scale-105 bg-white/10 hover:bg-white/20 border border-white/20"
                      >
                        <LazyRotateCcw className="w-6 h-6 text-white" />
                      </button>
                    </div>

                    <div className="px-4 py-2 rounded-lg text-sm inline-block cursor-pointer transition-colors bg-white/10 hover:bg-white/20 border border-white/20 text-white">
                      <Target className="w-4 h-4 inline-block mr-2" />
                      POMODORO TIMER
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Debrief Protocol */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-icon-bg-cyan)',
                      border: '1px solid var(--color-icon-border-cyan)',
                    }}
                  >
                    {visibleSections.has('arsenal') ? (
                      <LazyBarChart3
                        className="h-8 w-8"
                        style={{ color: 'var(--color-accent-text)' }}
                      />
                    ) : (
                      <div className="h-8 w-8 bg-cyan-500/20 rounded animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Debrief Protocol
                    </h3>
                    <p
                      className="text-base"
                      style={{ color: 'var(--color-secondary-text)' }}
                    >
                      Learn from every mission. Get better.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span className="text-sm">
                      Compare estimated vs actual time
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span className="text-sm">
                      Track what worked and what didn&apos;t
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span className="text-sm">
                      Build better time estimation skills
                    </span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div
                  className="bg-slate-900 rounded-lg p-6 border h-80 flex flex-col"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div
                    className="text-sm font-mono mb-4"
                    style={{ color: 'var(--color-accent-text)' }}
                  >
                    MISSION DEBRIEF
                  </div>
                  <div className="bg-slate-800 rounded p-4 flex-1">
                    <div
                      className="text-lg font-semibold mb-4"
                      style={{ color: 'var(--color-success)' }}
                    >
                      MISSION SUCCESSFUL
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <div
                          className="font-mono mb-1 text-xs"
                          style={{ color: 'var(--color-accent-text)' }}
                        >
                          ESTIMATED TIME
                        </div>
                        <div>2 hours</div>
                      </div>
                      <div>
                        <div
                          className="font-mono mb-1 text-xs"
                          style={{ color: 'var(--color-accent-text)' }}
                        >
                          ACTUAL TIME
                        </div>
                        <div>1 hour 45 minutes</div>
                      </div>
                    </div>
                    <div>
                      <div
                        className="font-mono mb-1 text-xs"
                        style={{ color: 'var(--color-accent-text)' }}
                      >
                        INTEL NOTES
                      </div>
                      <div className="text-xs bg-slate-700 rounded p-2">
                        Authentication flow was simpler than expected.
                        Documentation was accurate.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-16 px-4" data-section id="screenshots">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="bg-[var(--color-landing-backdrop)] px-6 py-4 rounded-lg max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                MISSION INTERFACE
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: 'var(--color-secondary-text)' }}
              >
                Experience the pristine cockpit philosophy - clean, powerful,
                and purpose-built for peak performance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {visibleSections.has('screenshots')
              ? screenshots.map((screenshot, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden group hover:scale-102 transition-transform duration-200"
                  >
                    <CardContent className="p-0">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={screenshot.placeholder}
                          alt={screenshot.alt}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-semibold mb-2">
                          {screenshot.title}
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: 'var(--color-secondary-text)' }}
                        >
                          {screenshot.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              : // Loading skeletons for screenshots
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-0">
                      <LoadingSkeleton className="h-48" />
                      <div className="p-6">
                        <LoadingSkeleton className="h-6 mb-2" />
                        <LoadingSkeleton className="h-4 w-3/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* ADHD-Friendly Badge Section */}
      <section className="py-16 px-4" data-section id="adhd">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div
              className="inline-flex items-center gap-4 rounded-full px-8 py-4 border"
              style={{
                backgroundColor: 'var(--color-secondary)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="text-3xl">🧠</div>
              <div>
                <div
                  className="text-lg font-bold"
                  style={{ color: 'var(--color-accent-text)' }}
                >
                  ADHD-FRIENDLY
                </div>
                <div
                  className="text-sm"
                  style={{ color: 'var(--color-secondary-text)' }}
                >
                  Built by commanders, for commanders
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 px-4" data-section id="cta">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-slate-900 to-slate-950">
            <CardContent className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">
                READY TO TAKE COMMAND?
              </h2>
              <p
                className="text-xl max-w-2xl mx-auto leading-relaxed"
                style={{ color: 'var(--color-secondary-text)' }}
              >
                Stop fighting your brain. Start winning the war against
                cognitive chaos. Your command deck awaits.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button
                  size="lg"
                  onClick={handleSignin}
                  className="min-w-[280px] text-lg py-6"
                >
                  <Lightning className="mr-2 h-6 w-6" />
                  BEGIN ONBOARDING
                </Button>
              </div>

              <div
                className="border-t pt-6"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Free forever</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Built by commanders</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-4 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-[var(--color-landing-backdrop)] px-6 py-3 rounded-lg inline-block">
            <div className="flex items-center justify-center gap-3 text-xs">
              <SystemStatus size="sm" />
              <span
                className="text-xs"
                style={{ color: 'var(--color-secondary-text)' }}
              >
                •
              </span>
              <LiveTime size="sm" format="compact" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
});

LandingPageComponent.displayName = 'LandingPage';

export function LandingPage() {
  return <LandingPageComponent />;
}
