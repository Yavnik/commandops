import posthog from 'posthog-js';

// Only initialize PostHog if key is provided
if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: '/ingest',
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: '2025-05-24',
    capture_exceptions: true,
    debug: process.env.NODE_ENV !== 'production',
  });
}
