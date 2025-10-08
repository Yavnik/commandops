import { StoreInitializer } from '@/components/store-initializer';
import { SystemStatusBar } from '@/components/system-status-bar';
import { CommandPanel } from '@/components/command-panel';
import { BackgroundMusicManager } from '@/components/background-music-manager';
import { WelcomeDialogWrapper } from '@/components/welcome-dialog-wrapper';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { ToastProvider } from '@/components/ui/toast';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/signin');
  }

  return (
    <ToastProvider>
      <StoreInitializer />
      <BackgroundMusicManager />
      <div className="min-h-screen relative overflow-x-hidden">
        <SystemStatusBar />
        <CommandPanel />
        {children}
        <WelcomeDialogWrapper />
      </div>
    </ToastProvider>
  );
}
