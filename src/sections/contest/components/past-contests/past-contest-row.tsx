import type { PastContestEntry } from '../../types';

import Link from 'next/link';
import { cn } from '@/src/lib/utils';

import { contestButtonClassName, contestPrimaryButtonClassName } from '../contest-theme';

type PastContestRowProps = {
  entry: PastContestEntry;
};

export function PastContestRow({ entry }: PastContestRowProps) {
  return (
    <Link
      href={entry.slug}
      className="flex w-full items-center gap-3 rounded-2xl bg-transparent sm:gap-4"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4 lg:w-[346px] lg:flex-none">
        <img
          src={entry.bannerUrl}
          alt={`${entry.title} banner`}
          className="h-12 w-16 rounded-lg border border-[rgba(226,232,240,0.7)] object-cover dark:border-white/10 lg:h-[72px] lg:w-[110px] lg:rounded-xl"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="line-clamp-1 truncate text-base font-medium text-[#0f172a] dark:text-white/90">
            {entry.title}
          </div>
          <div className="line-clamp-1 truncate text-xs text-[#64748b] dark:text-white/60">
            {entry.startsAt}
          </div>
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center justify-end gap-2 sm:gap-3">
        <span
          className={cn(
            contestButtonClassName,
            'shrink-0 whitespace-nowrap px-3 py-1 text-[11px] font-semibold leading-none text-[#334155] dark:text-white/70'
          )}
        >
          <span>{entry.score}</span>
        </span>
        <span
          className={cn(
            contestPrimaryButtonClassName,
            'shrink-0 whitespace-nowrap px-3 py-2 text-xs font-semibold'
          )}
        >
          Virtual
        </span>
      </div>
    </Link>
  );
}
