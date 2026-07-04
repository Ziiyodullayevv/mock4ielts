import type { Metadata } from 'next';

import { paths } from '@/src/routes/paths';
import { buildPageMetadata } from '@/src/lib/metadata';
import { ContestDetailView } from '@/src/sections/contest/view';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  return buildPageMetadata({
    description: 'Register for Mock4IELTS contests and compete on the leaderboard.',
    path: paths.contest.details(slug),
    title: 'Contest',
  });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  return <ContestDetailView contestId={slug} />;
}
