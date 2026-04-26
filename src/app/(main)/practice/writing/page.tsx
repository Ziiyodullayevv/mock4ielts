import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/metadata';
import { WritingView } from '@/sections/practice/writing/view';

export const metadata: Metadata = buildPageMetadata({
  description: 'Build IELTS writing structure, speed, and revision discipline.',
  path: '/practice/writing',
  title: 'Writing Practice',
});

export default function Page() {
  return <WritingView />;
}
