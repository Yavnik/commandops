import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { ScanLine } from '@/components/ui/ScanLine';
import { SEO_CONSTANTS, getBaseUrl, getFullTitle } from '@/lib/seo-constants';

// Import Google Fonts for Night Ops theme and CS:CZ theme
import { Roboto_Mono, Silkscreen } from 'next/font/google';
import { GlobalErrorBoundary } from '@/components/global-error-boundary';

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

const silkscreen = Silkscreen({
  subsets: ['latin'],
  variable: '--font-silkscreen',
  weight: '400',
  display: 'swap',
});

export const metadata: Metadata = {
  title: getFullTitle(),
  description: SEO_CONSTANTS.APP_DESCRIPTION,
  keywords: SEO_CONSTANTS.KEYWORDS,
  authors: [{ name: SEO_CONSTANTS.CREATOR }],
  creator: SEO_CONSTANTS.APP_NAME,
  publisher: SEO_CONSTANTS.APP_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(getBaseUrl()),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${SEO_CONSTANTS.APP_NAME} - ${SEO_CONSTANTS.APP_TAGLINE}`,
    description: SEO_CONSTANTS.SHORT_DESCRIPTION,
    url: '/',
    siteName: SEO_CONSTANTS.APP_NAME,
    images: [
      {
        url: SEO_CONSTANTS.IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: `${SEO_CONSTANTS.APP_NAME} - Futuristic productivity interface`,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SEO_CONSTANTS.APP_NAME} - ${SEO_CONSTANTS.APP_TAGLINE}`,
    description: SEO_CONSTANTS.SHORT_DESCRIPTION,
    images: [SEO_CONSTANTS.IMAGE_PATH],
    creator: SEO_CONSTANTS.TWITTER_HANDLE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`antialiased ${robotoMono.variable} ${silkscreen.variable}`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="default"
          themes={['default', 'nightops', 'cscz']}
          enableSystem={false}
          storageKey="command-ops-theme"
        >
          <GlobalErrorBoundary>
            {/* Scan line effect */}
            <ScanLine />
            {children}
          </GlobalErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
