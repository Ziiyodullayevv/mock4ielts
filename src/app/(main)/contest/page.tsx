import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/metadata';
import { ContestView } from '@/sections/contest/view';

export const metadata: Metadata = buildPageMetadata({
  description: 'Enter IELTS-style contests and review performance under pressure.',
  path: '/contest',
  title: 'Contest',
});

export default function Page() {
  return <ContestView />;
}
