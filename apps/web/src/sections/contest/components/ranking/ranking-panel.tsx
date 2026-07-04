'use client';

import type { RankingTab, RankingUser } from '../../types';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/src/lib/utils';

import { RankingList } from './ranking-list';
import { RankingTabs } from './ranking-tabs';
import { RankingPodium } from './ranking-podium';
import { contestButtonClassName } from '../contest-theme';

type RankingPanelProps = {
  isLoading?: boolean;
  podium: RankingUser[];
  list: RankingUser[];
  showMoreHref?: string;
};

export function RankingPanel({
  isLoading = false,
  podium,
  list,
  showMoreHref = '/contest/globalranking/?tab=global',
}: RankingPanelProps) {
  const [tab, setTab] = useState<RankingTab>('global');

  return (
    <div className="flex w-full max-w-[540px] flex-col items-stretch gap-4 self-center lg:max-w-[320px] lg:self-start">
      <div className="flex w-full justify-center lg:justify-end">
        <RankingTabs active={tab} onChange={setTab} />
      </div>

      <RankingPodium users={podium} />

      {isLoading ? (
        <RankingSkeleton />
      ) : podium.length === 0 && list.length === 0 ? (
        <div className="rounded-2xl bg-black/5 px-4 py-8 text-center text-sm text-black/55 dark:bg-white/7 dark:text-white/55">
          No leaderboard data yet.
        </div>
      ) : (
        <RankingList users={list} />
      )}

      <div className="mt-1 flex w-full items-center justify-center">
        <Link
          href={showMoreHref}
          className={cn(contestButtonClassName, 'min-h-9 px-4 text-xs')}
        >
          <span>Show More</span>
        </Link>
      </div>
    </div>
  );
}

function RankingSkeleton() {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-16 w-full animate-pulse rounded-2xl bg-black/8 dark:bg-white/8"
        />
      ))}
    </div>
  );
}
