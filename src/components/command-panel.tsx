'use client';

import { useCommandOpsStore } from '@/store/command-ops-store';
import { Button } from '@/components/ui/button';
import {
  Plus,
  LayoutDashboard,
  User,
  Briefcase,
  Archive,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NewQuestDialog } from '@/components/new-quest-dialog';
import { FeedbackDialog } from '@/components/feedback-dialog';
import { useMobile } from '@/hooks/use-mobile';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  { id: 'missions', label: 'Missions', icon: Briefcase, href: '/missions' },
  { id: 'archive', label: 'Mission Log', icon: Archive, href: '/archive' },
];

export function CommandPanel() {
  const [newQuestOpen, setNewQuestOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { commander, sidebarOpen, setSidebarOpen } = useCommandOpsStore();
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMobile();

  // Helper function to close sidebar on mobile after action
  const handleActionAndClose = (action: () => void) => {
    action();
    // Close sidebar on mobile/tablet (below md breakpoint)
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile/tablet (below md breakpoint)
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-[52px] sm:top-[56px] md:top-[60px] bottom-0 w-64 bg-secondary backdrop-blur-md border-r border-sidebar-border flex flex-col z-40 transition-transform duration-300 ease-in-out',
          // Mobile: slide in from left when open, hidden when closed
          'md:translate-x-0', // Always visible on desktop
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Operative ID Module */}
        <div className="p-4 border-b border-sidebar-border">
          <h3 className="text-xs text-secondary-text uppercase tracking-wider mb-3">
            Operative ID
          </h3>
          <div className="flex items-center gap-3">
            <div
              className="border flex items-center justify-center"
              style={{
                width: '3rem',
                height: '3rem',
                backgroundColor: 'var(--color-avatar-bg)',
                borderColor: 'var(--color-avatar-border)',
                borderRadius: 'var(--border-radius-full, 9999px)',
              }}
            >
              <User
                className="h-6 w-6"
                style={{ color: 'var(--color-sidebar-user-icon)' }}
              />
            </div>
            <div className="flex-1">
              <p
                className="font-semibold text-sm sm:text-base"
                style={{ color: 'var(--color-sidebar-username)' }}
              >
                {commander.username}
              </p>
            </div>
          </div>
        </div>

        {/* Deploy New Quest Button */}
        <div className="p-3 sm:p-4">
          <Button
            onClick={() => handleActionAndClose(() => setNewQuestOpen(true))}
            className="w-full h-10 sm:h-12 text-sm sm:text-base font-bold"
            variant="default"
          >
            <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            DEPLOY NEW QUEST
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4">
          <div className="space-y-1 sm:space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = item.href && pathname === item.href;

              if (item.disabled) {
                return (
                  <button
                    key={item.id}
                    disabled
                    className={cn(
                      'w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 text-sm uppercase tracking-wider transition-all',
                      'text-secondary-text opacity-50 cursor-not-allowed'
                    )}
                    style={{
                      borderRadius: 'var(--border-radius-md, 0.375rem)',
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href!}
                  onClick={handleLinkClick}
                  className={cn(
                    'w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 text-sm uppercase tracking-wider transition-all border',
                    isActive
                      ? 'bg-selected-tab-bg text-sidebar-selected-text border-selected-tab-border'
                      : 'text-secondary-text hover:text-accent-text hover:bg-accent-text/10 border-transparent'
                  )}
                  style={{
                    borderRadius: 'var(--border-radius-md, 0.375rem)',
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Actions - Feedback and Help */}
        <div className="p-3 sm:p-4 border-t border-sidebar-border space-y-1 sm:space-y-2">
          {/* Feedback Button */}
          <button
            onClick={() => handleActionAndClose(() => setFeedbackOpen(true))}
            className={cn(
              'w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 text-sm uppercase tracking-wider transition-all border',
              'text-secondary-text hover:text-accent-text hover:bg-accent-text/10 border-transparent'
            )}
            style={{
              borderRadius: 'var(--border-radius-md, 0.375rem)',
            }}
          >
            <MessageSquare className="h-4 w-4" />
            FEEDBACK
          </button>

          {/* Help Button */}
          <button
            onClick={() =>
              handleActionAndClose(() =>
                router.push(`${pathname}?showHelp=true`)
              )
            }
            className={cn(
              'w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 text-sm uppercase tracking-wider transition-all border',
              'text-secondary-text hover:text-accent-text hover:bg-accent-text/10 border-transparent'
            )}
            style={{
              borderRadius: 'var(--border-radius-md, 0.375rem)',
            }}
          >
            <HelpCircle className="h-4 w-4" />
            HELP
          </button>
        </div>
      </aside>

      {/* New Quest Dialog */}
      <NewQuestDialog open={newQuestOpen} onOpenChange={setNewQuestOpen} />

      {/* Feedback Dialog */}
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  );
}
