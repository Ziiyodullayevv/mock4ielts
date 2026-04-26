import type { Metadata } from 'next';

import { ContestView } from '@/sections/contest/view';
import { buildPageMetadata } from '@/src/lib/metadata';

export const metadata: Metadata = buildPageMetadata({
  description: 'Enter IELTS-style contests and review performance under pressure.',
  path: '/contest',
  title: 'Contest',
});

export default function Page() {
  return <ContestView />;
}
