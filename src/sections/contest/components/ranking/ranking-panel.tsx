'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/src/lib/utils';

import type { RankingTab, RankingUser } from '../../types';
import { contestButtonClassName } from '../contest-theme';

import { RankingList } from './ranking-list';
import { RankingPodium } from './ranking-podium';
import { RankingTabs } from './ranking-tabs';

type RankingPanelProps = {
  podium: RankingUser[];
  list: RankingUser[];
  showMoreHref?: string;
};

export function RankingPanel({
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

      <RankingList users={list} />

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
