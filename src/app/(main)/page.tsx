import type { Metadata } from 'next';

import { CONFIG } from '@/src/global-config';
import { HomeView } from '@/src/sections/home/view';

// --------------------------------------------------

export const metadata: Metadata = {
  title: {
    absolute: `${CONFIG.appName} - Real IELTS Practice, Mock Exams, Progress Tracking`,
  },
  description: 'Prepare for IELTS with realistic practice, full mock exams, and clear progress tracking.',
};

export default function Page() {
  return <HomeView />;
}
