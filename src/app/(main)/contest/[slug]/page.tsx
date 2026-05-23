import type { Metadata } from 'next';

import { notFound } from 'next/navigation';
import { paths } from '@/src/routes/paths';
import { buildPageMetadata } from '@/src/lib/metadata';
import { CONTESTS } from '@/src/sections/contest/data';
import { ContestDetailView } from '@/src/sections/contest/view';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const getContestPathSlug = (slug: string) => slug.replace(/^\/+|\/+$/g, '');

const findContestBySlug = (slug: string) =>
  CONTESTS.find((contest) => getContestPathSlug(contest.slug) === `contest/${slug}`);

export function generateStaticParams() {
  return CONTESTS.map((contest) => ({
    slug: getContestPathSlug(contest.slug).replace(/^contest\//, ''),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const contest = findContestBySlug(slug);

  if (!contest) {
    return buildPageMetadata({
      description: 'Register for Mock4IELTS contests and compete on the leaderboard.',
      path: paths.contest.details(slug),
      title: 'Contest',
    });
  }

  return buildPageMetadata({
    description:
      contest.description ?? 'Register for a timed Mock4IELTS contest and compete on the leaderboard.',
    image: contest.imageUrl,
    path: paths.contest.details(slug),
    title: contest.title,
  });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const contest = findContestBySlug(slug);

  if (!contest) {
    notFound();
  }

  return <ContestDetailView contest={contest} />;
}
