import type { Metadata } from 'next';

import { redirect } from 'next/navigation';
import { paths } from '@/src/routes/paths';
import { FEATURES } from '@/src/lib/features';
import { ContestView } from '@/sections/contest/view';
import { buildPageMetadata } from '@/src/lib/metadata';

export const metadata: Metadata = buildPageMetadata({
  description:
    'Join IELTS-style contests, test your skills under timed pressure, and compare your performance against other learners on the leaderboard.',
  path: '/contest',
  title: 'IELTS Contests | Compete & Improve Your Score',
});

export default function Page() {
  if (!FEATURES.contests) {
    redirect(paths.mockExam.root);
  }

  return <ContestView />;
}
