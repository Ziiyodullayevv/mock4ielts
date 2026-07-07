import '../globals.css';

import type { Metadata } from 'next';

import { Geist, Geist_Mono } from 'next/font/google';
import { CONFIG, getAssetUrl } from '@/src/global-config';
import { ThemeProvider } from '@/src/components/providers/theme-provider';
import {
  siteUrl,
  brandLogo,
  metadataBase,
  metadataDomain,
  defaultMetadataImage,
  defaultMetadataTitle,
  defaultMetadataImageWidth,
  defaultMetadataImageHeight,
  defaultMetadataDescription,
} from '@/src/lib/metadata';

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Mock4IELTS',
      description: defaultMetadataDescription,
      inLanguage: 'en',
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Mock4IELTS',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: new URL(brandLogo, metadataBase).toString(),
        width: 142,
        height: 130,
      },
      image: new URL(defaultMetadataImage, metadataBase).toString(),
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
  applicationName: CONFIG.appName,
  authors: [{ name: CONFIG.appName, url: metadataBase.toString() }],
  category: 'education',
  creator: CONFIG.appName,
  metadataBase,
  title: {
    default: defaultMetadataTitle,
    template: `%s - ${CONFIG.appName}`,
  },
  description: defaultMetadataDescription,
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
  manifest: '/manifest.webmanifest',
  other: {
    'twitter:domain': metadataDomain,
    'twitter:url': metadataBase.toString(),
  },
  openGraph: {
    description: defaultMetadataDescription,
    images: [
      {
        alt: `${CONFIG.appName} homepage preview`,
        height: defaultMetadataImageHeight,
        url: defaultMetadataImage,
        width: defaultMetadataImageWidth,
      },
    ],
    siteName: CONFIG.appName,
    title: defaultMetadataTitle,
    type: 'website',
    url: metadataBase.toString(),
  },
  publisher: CONFIG.appName,
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    index: true,
  },
  twitter: {
    card: 'summary_large_image',
    description: defaultMetadataDescription,
    images: [defaultMetadataImage],
    title: defaultMetadataTitle,
  },
  icons: [
    {
      rel: 'icon',
      url: brandLogo,
      type: 'image/svg+xml',
    },
    {
      rel: 'shortcut icon',
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
