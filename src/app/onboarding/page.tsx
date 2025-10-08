'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
// import { AuthCard } from '@/components/auth/auth-card';
import { authClient } from '@/lib/auth-client';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';
import { posthogCapture, posthogIdentify, posthogSetPersonProperties } from '@/lib/posthog-utils';

export default function OnboardingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Configurable timing variables (in milliseconds)
  const INITIAL_DELAY = 800; // Time before showing message
  const STEP_INTERVAL = 800; // Time between onboarding steps
  const TOTAL_DURATION = 7000; // Total time on page before redirect

  const allTerminalSteps = useMemo(
    () => [
      `IDENTITY CONFIRMED: ${userName.toUpperCase()}`,
      'CLEARANCE LEVEL: ALPHA',
      'STATUS: ACTIVE',
      'VERIFYING SECURITY CLEARANCE...',
      'LOADING MISSION PARAMETERS...',
      'DEPLOYMENT READY - STANDBY...',
    ],
    [userName]
  );

  // Check authentication and onboarding status
  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      try {
        const session = await authClient.getSession();

        if (!session.data?.user) {
          // Not authenticated, redirect to sign in
          router.push('/signin');
          return;
        }

        // Check if already onboarded
        const response = await fetch('/api/onboarding');
        const { onboardingCompleted } = await response.json();

        if (onboardingCompleted) {
          // Already onboarded, redirect to main app
          router.push('/dashboard');
          return;
        }

        // Set user data and start onboarding
        setUserName(session.data.user.name || 'Commander');

        // Identify user in PostHog (in case they navigated directly to onboarding)
        if (session.data.user.id) {
          posthogIdentify(session.data.user.id, {
            email: session.data.user.email,
            name: session.data.user.name,
          });
        }

        posthogCapture('onboarding_started', {
          user_id: session.data?.user?.id,
          user_name: session.data?.user?.name,
        });

        // Show message immediately
        setTimeout(() => setShowMessage(true), INITIAL_DELAY);

        // Start stepping through all terminal lines
        setTimeout(() => {
          let stepIndex = 0;
          const stepInterval = setInterval(() => {
            stepIndex++;
            if (stepIndex > allTerminalSteps.length) {
              clearInterval(stepInterval);
              // Redirect after last step completes
              setTimeout(() => {
                router.push('/dashboard?showHelp=true');
              }, 1000);
              return;
            }
            setCurrentStep(stepIndex);
          }, STEP_INTERVAL);
        }, INITIAL_DELAY + 1000);

        // Complete onboarding API call
        setTimeout(async () => {
          try {
            await fetch('/api/onboarding', { method: 'POST' });
            // Set user property to mark onboarding as completed
            posthogSetPersonProperties({
              onboarding_completed: true,
              onboarding_completed_at: new Date().toISOString(),
            });

            posthogCapture('onboarding_completed', {
              user_id: session.data?.user?.id,
              duration_seconds: TOTAL_DURATION / 1000,
            });
          } catch (error) {
            console.error('Error completing onboarding:', error);
            posthogCapture('onboarding_failed', {
              user_id: session.data?.user?.id,
              error: error instanceof Error ? error.message : String(error),
            });
            showEnhancedErrorToast(error, {
              context: 'Onboarding Completion',
              onRetry: async () => {
                try {
                  await fetch('/api/onboarding', { method: 'POST' });
                  posthogCapture('onboarding_retry_success', {
                    user_id: session.data?.user?.id,
                  });
                } catch (retryError) {
                  console.error('Retry failed:', retryError);
                  posthogCapture('onboarding_retry_failed', {
                    user_id: session.data?.user?.id,
                    error:
                      retryError instanceof Error
                        ? retryError.message
                        : String(retryError),
                  });
                }
              },
            });
          }
        }, TOTAL_DURATION);
      } catch (error) {
        console.error('Error checking auth status:', error);
        showEnhancedErrorToast(error, {
          context: 'Authentication Check',
          onRetry: () => checkAuthAndOnboarding(),
        });
        router.push('/signin');
      }
    };

    checkAuthAndOnboarding();
  }, [router, allTerminalSteps]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-card)' }}
    >
      <div className="w-full max-w-2xl">
        <div
          className="rounded-lg shadow-2xl"
          style={{
            backgroundColor: 'var(--color-dialog-bg)',
            border: `1px solid var(--color-dialog-border)`,
            boxShadow: 'var(--color-dialog-shadow)',
          }}
        >
          {/* Header */}
          <div
            className="p-6 text-center"
            style={{ borderBottom: `1px solid var(--color-border)` }}
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--color-text)' }}
              ></div>
              <h1
                className="text-2xl font-bold font-mono tracking-wider"
                style={{ color: 'var(--color-text)' }}
              >
                COMMAND OPS
              </h1>
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--color-text)' }}
              ></div>
            </div>
            <p
              className="font-mono text-sm tracking-wide"
              style={{ color: 'var(--color-secondary-text)' }}
            >
              TACTICAL OPERATIONS NETWORK
            </p>
          </div>

          {/* Main Content */}
          <div className="p-8">
            <div
              className={`transition-all duration-1000 ${
                showMessage
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
            >
              {/* Welcome Message */}
              <div className="text-center mb-8">
                <div
                  className="font-mono text-lg mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  WELCOME, COMMANDER {userName.toUpperCase()}
                </div>
                <div
                  className="font-mono text-sm"
                  style={{ color: 'var(--color-secondary-text)' }}
                >
                  INITIATING SECURE CONNECTION TO COMMAND GRID...
                </div>
              </div>

              {/* Terminal Display */}
              <div
                className="rounded p-6 mb-6"
                style={{
                  backgroundColor: 'var(--color-background)',
                  border: `1px solid var(--color-border)`,
                }}
              >
                <div className="flex items-center mb-4">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span
                      className="font-mono text-xs"
                      style={{ color: 'var(--color-text)' }}
                    >
                      COMMAND_TERMINAL_v1.0
                    </span>
                  </div>
                </div>

                <div className="space-y-2 font-mono text-sm">
                  {allTerminalSteps.map((step, index) => (
                    <div
                      key={index}
                      className="transition-all duration-500"
                      style={{
                        color:
                          index === currentStep
                            ? 'var(--color-text)'
                            : index < currentStep
                              ? 'var(--color-text)'
                              : 'var(--color-secondary-text)',
                        opacity: index <= currentStep ? 1 : 0.3,
                      }}
                    >
                      $ {step}
                      {index === currentStep && (
                        <span
                          className="inline-block w-2 h-4 ml-1 animate-pulse"
                          style={{ backgroundColor: 'var(--color-text)' }}
                        ></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Bar */}
              <div
                className="rounded p-4"
                style={{
                  backgroundColor: 'var(--color-muted)',
                  border: `1px solid var(--color-border)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: 'var(--color-text)' }}
                    ></div>
                    <span
                      className="font-mono text-xs"
                      style={{ color: 'var(--color-text)' }}
                    >
                      NEURAL INTERFACE ACTIVE
                    </span>
                  </div>
                  <div
                    className="font-mono text-xs"
                    style={{ color: 'var(--color-secondary-text)' }}
                  >
                    DEPLOYMENT: T-
                    {Math.max(
                      0,
                      Math.ceil(
                        ((allTerminalSteps.length - currentStep) *
                          STEP_INTERVAL) /
                          1000
                      )
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="h-1 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        backgroundColor: 'var(--color-border)',
                        width: `${Math.max(0, (currentStep / allTerminalSteps.length) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
