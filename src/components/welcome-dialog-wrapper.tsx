'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WelcomeDialog } from './welcome-dialog';
import { NewQuestDialog } from './new-quest-dialog';

export function WelcomeDialogWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showHelp = searchParams.get('showHelp');
  const [showDialog, setShowDialog] = useState(() => showHelp === 'true');
  const [showNewQuest, setShowNewQuest] = useState(false);
  const urlCleanedRef = useRef(false);

  // Open the help dialog when the showHelp param appears (render-time, on a
  // showHelp change; compares the primitive value, not the searchParams object,
  // so it converges even if useSearchParams returns a new reference).
  const [prevShowHelp, setPrevShowHelp] = useState(showHelp);
  if (showHelp !== prevShowHelp) {
    setPrevShowHelp(showHelp);
    if (showHelp === 'true') {
      setShowDialog(true);
    }
  }

  // Clean up the URL once the dialog is shown (navigation side effect).
  useEffect(() => {
    if (showDialog && !urlCleanedRef.current) {
      router.replace(window.location.pathname);
      urlCleanedRef.current = true;
    }
  }, [showDialog, router]);

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
