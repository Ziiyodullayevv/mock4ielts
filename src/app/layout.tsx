import '../globals.css';

import type { Metadata } from 'next';

import { Geist, Geist_Mono } from 'next/font/google';
import { CONFIG, getAssetUrl } from '@/src/global-config';
import { ThemeProvider } from '@/src/components/providers/theme-provider';
import { metadataBase, metadataDomain, defaultMetadataImage } from '@/src/lib/metadata';

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
    'Prepare for IELTS with realistic practice, full mock exams, and clear progress tracking.',
  other: {
    'twitter:domain': metadataDomain,
    'twitter:url': metadataBase.toString(),
  },
  openGraph: {
    description: 'Prepare for IELTS with realistic practice, full mock exams, and clear progress tracking.',
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
    description: 'Prepare for IELTS with realistic practice, full mock exams, and clear progress tracking.',
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased transition-colors duration-300`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
