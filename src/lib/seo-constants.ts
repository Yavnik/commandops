export const SEO_CONSTANTS = {
  APP_NAME: 'Command Ops',
  APP_TAGLINE: 'Executive Function Support System',
  APP_DESCRIPTION:
    'Transform your productivity with Command Ops - a high-performance, ADHD-friendly task management system designed to eliminate overwhelm and task paralysis. Built for developers, designers, and entrepreneurs.',
  SHORT_DESCRIPTION:
    'Not a to-do list. A high-performance fighter jet for your productivity. ADHD-friendly task management designed to eliminate overwhelm.',
  KEYWORDS: [
    'productivity app',
    'ADHD task management',
    'executive function support',
    'task management',
    'productivity software',
    'ADHD tools',
    'focus app',
    'time management',
    'task paralysis',
    'developer productivity',
  ] as string[],
  CREATOR: 'Command Ops Team',
  TWITTER_HANDLE: '@CommandOpsApp',
  IMAGE_PATH: '/opengraph-image.png',
} as const;

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000';
}

export function getFullTitle(pageTitle?: string) {
  if (pageTitle) {
    return `${pageTitle} - ${SEO_CONSTANTS.APP_NAME}`;
  }
  return `${SEO_CONSTANTS.APP_NAME} - ${SEO_CONSTANTS.APP_TAGLINE} | ADHD-Friendly Productivity`;
}
