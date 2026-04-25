'use client';

import { Hourglass } from 'lucide-react';

import { useCountdown } from '../hooks';
import { formatCountdown } from '../utils';

type ContestCountdownChipProps = {
  startsAt: Date;
  endsAt: Date;
};

export function ContestCountdownChip({ startsAt, endsAt }: ContestCountdownChipProps) {
  const now = new Date();
  const isLive = now >= startsAt && now < endsAt;

  if (isLive) {
    return <LiveBadge />;
  }

  return <UpcomingBadge target={startsAt} />;
}

function LiveBadge() {
  return (
    <div
      className="pointer-events-none absolute right-7 top-7 z-20 inline-flex items-center gap-2 rounded-full bg-black/5 px-3.5 py-1.5 text-xs font-medium tracking-tight text-emerald-700 backdrop-blur-xl dark:text-emerald-300"
      aria-label="Contest is live"
    >
      <span
        className="size-2 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400"
        aria-hidden
      />
      <span className="whitespace-nowrap">Live Now</span>
    </div>
  );
}

function UpcomingBadge({ target }: { target: Date }) {
  const parts = useCountdown(target);

  return (
    <div
      className="pointer-events-none absolute right-5 top-5 z-20 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-tight backdrop-blur-xl text-white"
      aria-label="Contest countdown"
    >
      <Hourglass className="size-3" strokeWidth={2} aria-hidden />
      <span className="whitespace-nowrap tabular-nums">{formatCountdown(parts)}</span>
    </div>
  );
}
