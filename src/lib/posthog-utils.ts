import posthog from 'posthog-js';

/**
 * Check if PostHog is enabled and properly initialized
 */
export function isPostHogEnabled(): boolean {
  return !!(process.env.NEXT_PUBLIC_POSTHOG_KEY && posthog.__loaded);
}

/**
 * Safe PostHog capture - only executes if PostHog is enabled
 */
export function posthogCapture(
  event: string,
  properties?: Record<string, unknown>
): void {
  if (isPostHogEnabled()) {
    posthog.capture(event, properties);
  }
}

/**
 * Safe PostHog exception capture - only executes if PostHog is enabled
 */
export function posthogCaptureException(
  error: unknown,
  properties?: Record<string, unknown>
): void {
  if (isPostHogEnabled()) {
    const errorToCapture = error instanceof Error ? error : new Error(String(error));
    posthog.captureException(errorToCapture, properties);
  }
}

/**
 * Safe PostHog identify - only executes if PostHog is enabled
 */
export function posthogIdentify(
  distinctId: string,
  properties?: Record<string, unknown>
): void {
  if (isPostHogEnabled()) {
    posthog.identify(distinctId, properties);
  }
}

/**
 * Safe PostHog set person properties - only executes if PostHog is enabled
 */
export function posthogSetPersonProperties(
  properties: Record<string, unknown>
): void {
  if (isPostHogEnabled()) {
    posthog.setPersonProperties(properties);
  }
}