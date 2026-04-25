import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/metadata';
import { ListeningView } from '@/sections/practice/listening/view';

export const metadata: Metadata = buildPageMetadata({
  description: 'Train IELTS listening with targeted drills and review loops.',
  path: '/practice/listening',
  title: 'Listening Practice',
});

export default function Page() {
  return <ListeningView />;
}
