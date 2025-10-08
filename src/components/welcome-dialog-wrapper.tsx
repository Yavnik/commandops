'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WelcomeDialog } from './welcome-dialog';
import { NewQuestDialog } from './new-quest-dialog';

export function WelcomeDialogWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showDialog, setShowDialog] = useState(false);
  const [showNewQuest, setShowNewQuest] = useState(false);
  const [urlCleaned, setUrlCleaned] = useState(false);

  useEffect(() => {
    // Check if the URL has the showHelp parameter
    const showHelp = searchParams.get('showHelp');

    if (showHelp === 'true') {
      setShowDialog(true);
    }
  }, [searchParams]);

  // Clean up URL when dialog is displayed
  useEffect(() => {
    if (showDialog && !urlCleaned) {
      const newUrl = window.location.pathname;
      router.replace(newUrl);
      setUrlCleaned(true);
    }
  }, [showDialog, urlCleaned, router]);

  const handleClose = () => {
    setShowDialog(false);
  };

  const handleOpenNewQuest = () => {
    setShowNewQuest(true);
  };

  return (
    <>
      <WelcomeDialog
        isOpen={showDialog}
        onClose={handleClose}
        onOpenNewQuest={handleOpenNewQuest}
      />
      <NewQuestDialog open={showNewQuest} onOpenChange={setShowNewQuest} />
    </>
  );
}
