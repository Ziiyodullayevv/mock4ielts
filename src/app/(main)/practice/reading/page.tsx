import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/metadata';
import { ReadingView } from '@/sections/practice/reading/view';

export const metadata: Metadata = buildPageMetadata({
  description:
    'Practice IELTS Reading with real exam-style passages, question types, and timing. Build speed, accuracy, and skimming skills to achieve your target band score.',
  path: '/practice/reading',
  title: 'IELTS Reading Practice | Passages & Question Types',
});

export default function Page() {
  return <ReadingView />;
}
