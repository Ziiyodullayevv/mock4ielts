import '../globals.css';

import type { Metadata } from 'next';

import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from '@/src/components/ui/sonner';
import { CONFIG, getAssetUrl } from '@/src/global-config';
import { TooltipProvider } from '@/src/components/ui/tooltip';
import { QueryProvider } from '@/src/components/providers/query-provider';
import { NavigationProgress } from '@/src/components/navigation/navigation-progress';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: `${CONFIG.appName} - Real IELTS Practice, Mock Exams, Progress Tracking`,
    template: `%s - ${CONFIG.appName}`,
  },
  description:
    'Practice IELTS smarter with targeted drills, full mock exams, and progress tracking.',

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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-black antialiased`}>
        <QueryProvider>
          <TooltipProvider>
            <NavigationProgress />
            {children}
            <Toaster />
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
