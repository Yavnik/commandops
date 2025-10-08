'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Target, Zap, MapPin, Rocket } from 'lucide-react';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';
import { NavigationErrorBoundary } from '@/components/error-boundary-enhanced';

interface WelcomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewQuest?: () => void;
}

function WelcomeDialogContent({
  isOpen,
  onClose,
  onOpenNewQuest,
}: WelcomeDialogProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Target,
      title: 'QUESTS',
      subtitle: 'Your Mission Objectives',
      description:
        'Individual tasks that drive your success. Create, deploy, and complete.',
      visual: (
        <div className="w-full h-40 rounded-lg overflow-hidden border border-accent-text/30 relative">
          <Image
            src="/screenshot-1.jpeg"
            alt="Quest board showing three-column Kanban layout with Planning Zone, Active Operations, and Mission Complete sections"
            fill
            className="object-cover"
          />
        </div>
      ),
    },
    {
      icon: MapPin,
      title: 'MISSIONS',
      subtitle: 'Strategic Operations',
      description:
        'Group related quests under strategic objectives. Your command structure.',
      visual: (
        <div className="w-full h-40 rounded-lg overflow-hidden border border-accent-text/30 relative">
          <Image
            src="/screenshot-3.jpeg"
            alt="Mission Control strategic overview showing multiple active missions with critical quest counts and priority indicators"
            fill
            className="object-cover"
          />
        </div>
      ),
    },
    {
      icon: Zap,
      title: 'DEPLOYMENT',
      subtitle: 'Battle Station Ready',
      description:
        'Activate quests with tactical planning. Enter focus mode for deep work.',
      visual: (
        <div className="w-full h-40 rounded-lg overflow-hidden border border-accent-text/30 relative">
          <Image
            src="/screenshot-2.jpeg"
            alt="Battle Station focus mode with Pomodoro timer and task progress indicators for deep work sessions"
            fill
            className="object-cover"
          />
        </div>
      ),
    },
    {
      icon: Rocket,
      title: 'READY FOR DEPLOYMENT',
      subtitle: 'Your First Mission',
      description: 'Click "DEPLOY NEW QUEST" to create your first objective.',
      visual: (
        <button
          type="button"
          onClick={() => {
            try {
              onOpenNewQuest?.();
              onClose();
            } catch (error) {
              console.error('Failed to open new quest dialog:', error);
              showEnhancedErrorToast(error, {
                context: 'Welcome Tutorial',
              });
            }
          }}
          className="w-full h-32 rounded-lg bg-accent-text/10 border border-accent-text/30 flex flex-col items-center justify-center space-y-2 hover:bg-accent-text/20 transition-all duration-200 cursor-pointer"
        >
          <Rocket className="h-8 w-8 text-accent-text" />
          <span className="text-accent-text font-mono text-sm font-bold">
            DEPLOY NEW QUEST
          </span>
          <span className="text-secondary-text font-mono text-xs">
            Click this button to start
          </span>
        </button>
      ),
    },
  ];

  const nextSlide = () => {
    try {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error navigating welcome slides:', error);
      showEnhancedErrorToast(error, {
        context: 'Welcome Tutorial Navigation',
      });
    }
  };

  const prevSlide = () => {
    try {
      if (currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
      }
    } catch (error) {
      console.error('Error navigating welcome slides:', error);
      showEnhancedErrorToast(error, {
        context: 'Welcome Tutorial Navigation',
      });
    }
  };

  const current = slides[currentSlide];
  const IconComponent = current.icon;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--color-text)' }}
            />
            <DialogTitle className="font-mono text-xl tracking-wider">
              COMMAND OPS
            </DialogTitle>
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--color-text)' }}
            />
          </div>
          <DialogDescription className="font-mono text-xs tracking-wide uppercase text-center">
            TACTICAL ORIENTATION BRIEFING
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Slide Content */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <IconComponent className="h-6 w-6 text-accent-text" />
              <h3 className="font-mono text-lg font-bold text-accent-text tracking-wider">
                {current.title}
              </h3>
            </div>

            <p className="font-mono text-sm text-secondary-text tracking-wide">
              {current.subtitle}
            </p>

            {/* Visual Element */}
            <div className="my-6">{current.visual}</div>

            <p className="text-sm text-text leading-relaxed">
              {current.description}
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center space-x-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-accent-text'
                    : index < currentSlide
                      ? 'bg-accent-text/50'
                      : 'bg-border'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="font-mono text-xs tracking-wider"
            >
              PREVIOUS
            </Button>

            <span className="font-mono text-xs text-secondary-text">
              {currentSlide + 1} / {slides.length}
            </span>

            <Button
              type="button"
              onClick={nextSlide}
              className="font-mono text-xs tracking-wider"
              style={{
                backgroundColor: 'var(--color-accent-text)',
                color: 'var(--color-background)',
              }}
            >
              {currentSlide === slides.length - 1 ? 'GOT IT' : 'NEXT'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function WelcomeDialog({
  isOpen,
  onClose,
  onOpenNewQuest,
}: WelcomeDialogProps) {
  return (
    <NavigationErrorBoundary context="welcome tutorial">
      <WelcomeDialogContent
        isOpen={isOpen}
        onClose={onClose}
        onOpenNewQuest={onOpenNewQuest}
      />
    </NavigationErrorBoundary>
  );
}
