'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth/auth-card';
import { GoogleSignInButton } from '@/components/auth/google-signin-button';
import { GitHubSignInButton } from '@/components/auth/github-signin-button';
import { AlertCircle } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { showEnhancedErrorToast } from '@/lib/toast-enhanced';
import { posthogCapture, posthogIdentify } from '@/lib/posthog-utils';

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is already authenticated
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const session = await authClient.getSession();

        if (session.data?.user) {
          // User is already authenticated, check onboarding status
          const response = await fetch('/api/onboarding');
          const { onboardingCompleted } = await response.json();

          if (onboardingCompleted) {
            // Already onboarded, redirect to main app
            router.push('/dashboard');
          } else {
            // Need to complete onboarding
            router.push('/onboarding');
          }
          return;
        }

        // Not authenticated, show signin page
        setCheckingAuth(false);
      } catch (error) {
        console.error('Error checking existing auth:', error);
        showEnhancedErrorToast(error, {
          context: 'Authentication Check',
          onRetry: () => checkExistingAuth(),
        });
        setCheckingAuth(false);
      }
    };

    checkExistingAuth();
  }, [router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    posthogCapture('sign_in_attempt', {
      provider: 'google',
    });

    try {
      // const result = await authClient.signIn.email({
      //   email: "test@mail.com",
      //   password: "12345678",
      //   callbackURL: "/signin",
      // });
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/signin',
      });

      if (result.error) {
        setError(result.error.message || 'Google sign in failed');
        posthogCapture('sign_in_failed', {
          provider: 'google',
          error: result.error.message,
        });
      } else {
        // Successful sign in, check onboarding status
        const session = await authClient.getSession();
        if (session.data?.user) {
          const response = await fetch('/api/onboarding');
          const { onboardingCompleted } = await response.json();

          // Identify user in PostHog
          posthogIdentify(session.data.user.id, {
            email: session.data.user.email,
            name: session.data.user.name,
            provider: 'google',
          });

          posthogCapture('sign_in_success', {
            provider: 'google',
            user_id: session.data.user.id,
            onboarding_completed: onboardingCompleted,
          });

          if (onboardingCompleted) {
            router.push('/dashboard');
          } else {
            router.push('/onboarding');
          }
        }
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      setError('Google sign in failed');
      posthogCapture('sign_in_error', {
        provider: 'google',
        error: error instanceof Error ? error.message : String(error),
      });
      showEnhancedErrorToast(error, {
        context: 'Google Sign In',
        onRetry: () => handleGoogleSignIn(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    setError('');

    posthogCapture('sign_in_attempt', {
      provider: 'github',
    });

    try {
      const result = await authClient.signIn.social({
        provider: 'github',
        callbackURL: '/signin',
      });

      if (result.error) {
        setError(result.error.message || 'GitHub sign in failed');
        posthogCapture('sign_in_failed', {
          provider: 'github',
          error: result.error.message,
        });
      } else {
        // Successful sign in, check onboarding status
        const session = await authClient.getSession();
        if (session.data?.user) {
          const response = await fetch('/api/onboarding');
          const { onboardingCompleted } = await response.json();

          // Identify user in PostHog
          posthogIdentify(session.data.user.id, {
            email: session.data.user.email,
            name: session.data.user.name,
            provider: 'github',
          });

          posthogCapture('sign_in_success', {
            provider: 'github',
            user_id: session.data.user.id,
            onboarding_completed: onboardingCompleted,
          });

          if (onboardingCompleted) {
            router.push('/dashboard');
          } else {
            router.push('/onboarding');
          }
        }
      }
    } catch (error) {
      console.error('GitHub sign in error:', error);
      setError('GitHub sign in failed');
      posthogCapture('sign_in_error', {
        provider: 'github',
        error: error instanceof Error ? error.message : String(error),
      });
      showEnhancedErrorToast(error, {
        context: 'GitHub Sign In',
        onRetry: () => handleGitHubSignIn(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-lg">
            CHECKING AUTHENTICATION STATUS...
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthCard
      title="System Access"
      subtitle="Choose your authentication method to access the command ops"
    >
      {/* Error Display */}
      {error && (
        <div
          className="flex items-center gap-2 p-3 border rounded"
          style={{
            borderColor: 'var(--color-priority-critical-border)',
            backgroundColor: 'var(--color-priority-critical-border)',
            color: 'var(--color-priority-critical-text)',
          }}
        >
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* OAuth Sign In Options */}
      <div className="space-y-4">
        <GoogleSignInButton onClick={handleGoogleSignIn} disabled={isLoading} />
        <GitHubSignInButton onClick={handleGitHubSignIn} disabled={isLoading} />
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs" style={{ color: 'var(--color-secondary-text)' }}>
          By signing in, you agree to our{' '}
          <a
            href="/terms"
            className="underline hover:no-underline transition-all"
            style={{ color: 'var(--color-accent-text)' }}
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="/privacy"
            className="underline hover:no-underline transition-all"
            style={{ color: 'var(--color-accent-text)' }}
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </AuthCard>
  );
}
