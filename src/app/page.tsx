import type { Metadata } from 'next';

import { CONFIG } from '@/src/global-config';
import { HomeView } from '@/src/sections/home/view';
import { buildPageMetadata } from '@/src/lib/metadata';

export const metadata: Metadata = buildPageMetadata({
  absoluteTitle: true,
  description: 'Prepare for IELTS with realistic practice, full mock exams, and clear progress tracking.',
  path: '/',
  title: `${CONFIG.appName} - Real IELTS Practice, Mock Exams, Progress Tracking`,
});

export default function Page() {
  return <HomeView />;
}
