'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getQuestById } from '@/lib/queries/quests';
import { FocusMode } from '@/components/focus-mode/FocusMode';
import { Quest } from '@/types';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';

interface FocusPageProps {
  params: Promise<{
    questId: string;
  }>;
}

export default function FocusPage({ params }: FocusPageProps) {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadQuest() {
      try {
        const { questId } = await params;
        const questData = await getQuestById(questId);

        if (!questData || questData.status !== 'ACTIVE') {
          router.replace('/dashboard');
          return;
        }

        setQuest(questData);
      } catch (err) {
        console.error('Error loading quest for focus mode:', err);
        setError('Failed to load quest');
        showEnhancedErrorToast(err, {
          context: 'Quest Loading for Focus Mode',
          onRetry: () => loadQuest(),
        });
        router.replace('/dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadQuest();
  }, [params, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !quest) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return <FocusMode quest={quest} />;
}
