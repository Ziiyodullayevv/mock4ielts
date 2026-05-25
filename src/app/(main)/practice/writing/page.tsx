import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/metadata';
import { WritingView } from '@/sections/practice/writing/view';

export const metadata: Metadata = buildPageMetadata({
  description:
    'Practice IELTS Writing Task 1 and Task 2 with real exam prompts. Develop structure, coherence, and band 7+ writing techniques through timed exercises.',
  path: '/practice/writing',
  title: 'IELTS Writing Practice | Task 1 & Task 2 Prompts',
});

export default function Page() {
  return <WritingView />;
}
