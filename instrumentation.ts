import { PostHog } from 'posthog-node';

// Server-side PostHog instance
let posthogServer: PostHog | null = null;

export function register() {
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthogServer = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
      flushAt: 1, // Flush immediately in development
      flushInterval: 1000, // 1 second
    });
  }
}

export function getPostHogServer(): PostHog | null {
  return posthogServer;
}
