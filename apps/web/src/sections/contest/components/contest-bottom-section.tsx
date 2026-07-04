'use client';

import { useState } from 'react';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';

import { RankingPanel } from './ranking/ranking-panel';
import { PastContestsPanel } from './past-contests/past-contests-panel';
import { useContestsQuery, useMyContestStatsQuery, useContestLeaderboardQuery } from '../hooks';

export function ContestBottomSection() {
  const [pastPage, setPastPage] = useState(1);
  const { isAuthenticated, isHydrated } = useAuthSession();
  const finishedContestsQuery = useContestsQuery({ page: pastPage, size: 8, status: 'finished' });
  const allContestsQuery = useContestsQuery({ size: 1 });
  const myContestStatsQuery = useMyContestStatsQuery(isHydrated && isAuthenticated);
  const leaderboardContestId = allContestsQuery.data?.items[0]?.id;
  const leaderboardQuery = useContestLeaderboardQuery(leaderboardContestId, Boolean(leaderboardContestId));

  return (
    <div className="mt-12 flex w-full max-w-6xl flex-col items-start gap-12 md:items-center lg:flex-row lg:items-start lg:justify-center lg:gap-6">
      <RankingPanel
        isLoading={allContestsQuery.isLoading || leaderboardQuery.isLoading}
        list={leaderboardQuery.data?.list ?? []}
        podium={leaderboardQuery.data?.podium ?? []}
      />
      <PastContestsPanel
        entries={(finishedContestsQuery.data?.items ?? []).map((contest) => ({
          bannerUrl: contest.imageUrl,
          id: contest.id,
          score: contest.contestStatus === 'finished' ? 'View' : contest.contestStatus ?? 'View',
          slug: contest.slug,
          startsAt: new Intl.DateTimeFormat('en', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }).format(new Date(contest.startsAt)),
          title: contest.title,
        }))}
        isLoading={finishedContestsQuery.isLoading}
        myEntries={myContestStatsQuery.data?.pastContests ?? []}
        myEntriesLoading={isHydrated && isAuthenticated && myContestStatsQuery.isLoading}
        onPageChange={setPastPage}
        page={pastPage}
        totalPages={finishedContestsQuery.data?.pagination.pages ?? 1}
      />
    </div>
  );
}
