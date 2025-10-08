'use client';

import { useCommandOpsStore } from '@/store/command-ops-store';
import { Menu, LogOut, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeSelector } from '@/components/theme-selector';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { SystemStatus } from '@/components/system-status';
import { LiveTime } from '@/components/live-time';
import { useBackgroundMusic } from '@/hooks/use-background-music';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';

export function SystemStatusBar() {
  const { toggleSidebar } = useCommandOpsStore();
  const router = useRouter();
  const { isPlaying, isLoading, toggleMusic } = useBackgroundMusic();

  // Use Better Auth React hook for session management
  const session = authClient.useSession();
  const isAuthenticated = !!session.data?.user;

  // Add logout handler
  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/signin');
          },
        },
      });
    } catch (error) {
      console.error('Logout failed', error);
      showEnhancedErrorToast(error, {
        context: 'Logout',
        onRetry: async () => {
          try {
            await authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push('/signin');
                },
              },
            });
          } catch (retryError) {
            console.error('Retry failed:', retryError);
          }
        },
      });
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
      style={{
        backgroundColor: 'var(--color-header-bg, rgba(15, 23, 42, 0.8))',
        borderColor: 'var(--color-header-border, rgba(6, 182, 212, 0.5))',
      }}
    >
      <div className="flex items-center justify-between px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3">
        {/* Left: Mobile Menu + Logo */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 min-w-0">
          {/* Mobile Menu Button - Only show for authenticated users */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Logo Section */}
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 hidden sm:flex"
              style={{
                backgroundColor: 'var(--color-logo-bg, rgb(6, 182, 212))',
                borderRadius: 'var(--border-radius-md, 0.375rem)',
              }}
            >
              <span
                className="font-bold text-lg sm:text-xl"
                style={{
                  color: 'var(--color-logo-text, rgb(15, 23, 42))',
                }}
              >
                CO
              </span>
            </div>
            {/* Progressive title display based on screen size */}
            <div className="hidden sm:block min-w-0">
              <h1
                className="font-bold text-sm sm:text-base md:text-lg uppercase tracking-wider whitespace-nowrap"
                style={{
                  color: 'var(--color-command-ops-text, rgb(34, 211, 238))',
                }}
              >
                Command Ops
              </h1>
              <p
                className="text-xs hidden md:block"
                style={{
                  color: 'var(--color-secondary-text, rgb(148, 163, 184))',
                }}
              >
                v1.0.0
              </p>
            </div>
          </div>
        </div>

        {/* Right: Status Information */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 min-w-0">
          {/* Mobile: Dual Time Display */}
          <div className="sm:hidden">
            <div className="text-right">
              <LiveTime
                size="sm"
                format="dual"
                showLocal={true}
                layout="vertical"
                hideSeconds={true}
              />
            </div>
          </div>

          {/* Small screens: Dual Time Display */}
          <div className="hidden sm:flex md:hidden items-center">
            <LiveTime
              size="sm"
              format="dual"
              showLocal={true}
              layout="vertical"
            />
          </div>

          {/* Desktop: Full Status Information (md and up) */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            {/* System Status */}
            <SystemStatus size="md" />

            {/* Dual Time Display - UTC and Local */}
            <LiveTime
              size="md"
              format="dual"
              showLocal={true}
              layout="vertical"
            />

            {/* Theme Selector - Desktop only */}
            <div className="hidden lg:block">
              <ThemeSelector />
            </div>
          </div>

          {/* Theme Selector and Action Buttons - Minimal spacing */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Theme Selector for mobile and tablet */}
            <div className="lg:hidden">
              <ThemeSelector />
            </div>

            {/* Music Button - Only show for authenticated users */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 p-1 sm:p-2"
                onClick={toggleMusic}
                title={isPlaying ? 'Pause music' : 'Play music'}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Music
                    className={`h-4 w-4 ${isPlaying ? 'animate-[spin_3s_linear_infinite]' : ''}`}
                  />
                )}
              </Button>
            )}

            {/* Settings Button - Only show for authenticated users */}
            {/* {isAuthenticated && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0"
                onClick={() => setSettingsOpen(true)}
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )} */}

            {/* Logout Button - Only show for authenticated users */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 p-1 sm:p-2"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
