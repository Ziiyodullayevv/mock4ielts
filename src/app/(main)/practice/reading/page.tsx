import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/metadata';
import { ReadingView } from '@/sections/practice/reading/view';

export const metadata: Metadata = buildPageMetadata({
  description: 'Improve IELTS reading speed, control, and accuracy.',
  path: '/practice/reading',
  title: 'Reading Practice',
});

export default function Page() {
  return <ReadingView />;
}
