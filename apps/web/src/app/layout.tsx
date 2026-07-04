import '../globals.css';

import type { Metadata } from 'next';

import { Geist, Geist_Mono } from 'next/font/google';
import { CONFIG, getAssetUrl } from '@/src/global-config';
import { ThemeProvider } from '@/src/components/providers/theme-provider';
import { metadataBase, metadataDomain, defaultMetadataImage } from '@/src/lib/metadata';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mock4ielts.uz';

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Mock4IELTS',
      description:
        'All-in-one IELTS preparation platform with realistic mock exams, section practice, and progress tracking.',
      inLanguage: 'en',
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Mock4IELTS',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo/logo_red.png`,
      },
    },
  ],
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${CONFIG.appName} - Real IELTS Practice, Mock Exams, Progress Tracking`,
    template: `%s - ${CONFIG.appName}`,
  },
  description:
    'Prepare for IELTS with realistic mock exams, targeted section practice, and clear progress tracking. All four IELTS skills — Listening, Reading, Writing, Speaking — in one platform.',
  keywords: [
    'IELTS mock exam',
    'IELTS practice',
    'IELTS mock test online',
    'IELTS preparation',
    'IELTS listening practice',
    'IELTS reading practice',
    'IELTS writing practice',
    'IELTS speaking practice',
    'mock4ielts',
    'IELTS band score',
    'IELTS test simulation',
  ],
  other: {
    'twitter:domain': metadataDomain,
    'twitter:url': metadataBase.toString(),
  },
  openGraph: {
    description:
      'Prepare for IELTS with realistic mock exams, targeted section practice, and clear progress tracking.',
    images: [
      {
        url: defaultMetadataImage,
      },
    ],
    siteName: CONFIG.appName,
    title: `${CONFIG.appName} - Real IELTS Practice, Mock Exams, Progress Tracking`,
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    description:
      'Prepare for IELTS with realistic mock exams, targeted section practice, and clear progress tracking.',
    images: [defaultMetadataImage],
    title: `${CONFIG.appName} - Real IELTS Practice, Mock Exams, Progress Tracking`,
  },
  icons: [
    {
      rel: 'icon',
      url: getAssetUrl('/favicon.ico'),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased transition-colors duration-300`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="m4i-theme" disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
