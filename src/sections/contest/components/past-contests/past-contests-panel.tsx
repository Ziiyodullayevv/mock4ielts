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
  totalPages?: number;
};

export function PastContestsPanel({ entries, totalPages = 86 }: PastContestsPanelProps) {
  const [tab, setTab] = useState<PastContestTab>('past');
  const [page, setPage] = useState(1);

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
        {tab === 'past' ? (
          <div className="flex flex-col gap-4">
            {entries.map((entry) => (
              <PastContestRow key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      <ContestPagination page={page} totalPages={totalPages} onChange={setPage} />
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
