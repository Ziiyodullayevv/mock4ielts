'use client';

import type { PastContestTab, PastContestEntry } from '../../types';

import { useState } from 'react';
import { cn } from '@/src/lib/utils';

import { ShuffleButton } from './shuffle-button';
import { PastContestRow } from './past-contest-row';
import { PastContestsTabs } from './past-contests-tabs';
import { ContestPagination } from './contest-pagination';
import { contestPanelClassName, contestInsetCardClassName } from '../contest-theme';

type PastContestsPanelProps = {
  entries: PastContestEntry[];
  isLoading?: boolean;
  myEntries?: PastContestEntry[];
  myEntriesLoading?: boolean;
  onPageChange?: (page: number) => void;
  page?: number;
  totalPages?: number;
};

export function PastContestsPanel({
  entries,
  isLoading = false,
  myEntries = [],
  myEntriesLoading = false,
  onPageChange,
  page: controlledPage,
  totalPages = 1,
}: PastContestsPanelProps) {
  const [tab, setTab] = useState<PastContestTab>('past');
  const [internalPage, setInternalPage] = useState(1);
  const page = controlledPage ?? internalPage;
  const visibleEntries = tab === 'past' ? entries : myEntries;
  const visibleLoading = tab === 'past' ? isLoading : myEntriesLoading;
  const handlePageChange = (nextPage: number) => {
    setInternalPage(nextPage);
    onPageChange?.(nextPage);
  };

  return (
    <div
      className={cn(
        contestPanelClassName,
        'flex w-full max-w-[540px] flex-col self-center rounded-[28px] p-6 lg:min-h-[856px]'
      )}
    >
      <div className="flex items-center justify-between">
        <PastContestsTabs active={tab} onChange={setTab} />
        <ShuffleButton />
      </div>

      <div className="relative pt-6">
        {visibleLoading ? (
          <PastContestSkeleton />
        ) : visibleEntries.length > 0 ? (
          <div className="flex flex-col gap-4">
            {visibleEntries.map((entry) => (
              <PastContestRow key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      <ContestPagination page={page} totalPages={totalPages} onChange={handlePageChange} />
    </div>
  );
}

function PastContestSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="h-12 w-16 animate-pulse rounded-lg bg-black/8 dark:bg-white/8 lg:h-[72px] lg:w-[110px]" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-36 animate-pulse rounded-full bg-black/8 dark:bg-white/8" />
            <div className="h-3 w-24 animate-pulse rounded-full bg-black/8 dark:bg-white/8" />
          </div>
          <div className="h-8 w-16 animate-pulse rounded-full bg-black/8 dark:bg-white/8" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <div
        className={cn(
          contestInsetCardClassName,
          'grid h-32 w-32 place-items-center rounded-full text-3xl text-[#94a3b8] dark:text-white/40'
        )}
      >
        ∅
      </div>
      <p className="text-sm text-[#64748b] dark:text-white/60">No contests yet</p>
    </div>
  );
}
