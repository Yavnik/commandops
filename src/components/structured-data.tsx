import { SEO_CONSTANTS, getBaseUrl } from '@/lib/seo-constants';

interface StructuredDataProps {
  data: Record<string, unknown>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function getAppStructuredData() {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SEO_CONSTANTS.APP_NAME,
    description: SEO_CONSTANTS.APP_DESCRIPTION,
    url: baseUrl,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString(),
    },
    creator: {
      '@type': 'Organization',
      name: SEO_CONSTANTS.CREATOR,
    },
    keywords: SEO_CONSTANTS.KEYWORDS.join(', '),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
    featureList: [
      'Three-quest active limit to prevent overwhelm',
      'Visual priority system for critical tasks',
      'Full-screen focus mode (Battle Station)',
      'Pomodoro timer integration',
      'Mission debrief and time tracking',
      'ADHD-friendly interface design',
      'Multiple tactical themes',
    ],
    screenshot: `${baseUrl}${SEO_CONSTANTS.IMAGE_PATH}`,
    softwareVersion: '1.0',
    releaseNotes: 'Initial release of Command Ops productivity system',
  };
}
