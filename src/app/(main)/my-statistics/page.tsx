import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/metadata';
import { MyStatisticsView } from '@/src/sections/statistics/view';

export const metadata: Metadata = buildPageMetadata({
  description: 'Review your Mock4IELTS practice progress, section averages, and exam statistics.',
  path: '/my-statistics',
  title: 'My Statistics',
});

export default function Page() {
  return <MyStatisticsView />;
}
