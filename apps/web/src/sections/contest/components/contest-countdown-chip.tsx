'use client';

import { Hourglass } from 'lucide-react';

import { useCountdown } from '../hooks';
import { formatCountdown } from '../utils';

type ContestCountdownChipProps = {
  startsAt: Date;
  endsAt: Date;
  status?: 'finished' | 'grading' | 'live' | 'scheduled' | 'upcoming';
  variant?: 'desktop' | 'mobile';
};

export function ContestCountdownChip({
  startsAt,
  endsAt,
  status,
  variant = 'desktop',
}: ContestCountdownChipProps) {
  const now = new Date();
  const isLive = status === 'live' || (!status && now >= startsAt && now < endsAt);
  const isCompleted =
    status === 'finished' || status === 'grading' || (!status && now >= endsAt);

  if (isCompleted) {
    return <CompletedBadge variant={variant} />;
  }

  if (isLive) {
    return <LiveBadge variant={variant} />;
  }

  return <UpcomingBadge target={startsAt} variant={variant} />;
}

function CompletedBadge({ variant }: { variant: 'desktop' | 'mobile' }) {
  return (
    <div
      className={
        variant === 'mobile'
          ? 'pointer-events-none absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-white/84 px-4 py-2 text-sm font-medium tracking-tight text-[#111827] shadow-[0_14px_26px_rgba(15,23,42,0.1)] backdrop-blur-xl dark:bg-[#141414]/88 dark:text-white dark:shadow-none'
          : 'pointer-events-none absolute right-5 top-5 z-20 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-tight text-white backdrop-blur-xl'
      }
      aria-label="Contest completed"
    >
      <Hourglass className={variant === 'mobile' ? 'size-4' : 'size-3'} strokeWidth={2} aria-hidden />
      <span className="whitespace-nowrap">Completed</span>
    </div>
  );
}

function LiveBadge({ variant }: { variant: 'desktop' | 'mobile' }) {
  return (
    <div
      className={
        variant === 'mobile'
          ? 'pointer-events-none absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-white/84 px-4 py-2 text-sm font-medium tracking-tight text-emerald-700 shadow-[0_14px_26px_rgba(15,23,42,0.1)] backdrop-blur-xl dark:bg-[#141414]/88 dark:text-emerald-300 dark:shadow-none'
          : 'pointer-events-none absolute right-7 top-7 z-20 inline-flex items-center gap-2 rounded-full bg-black/5 px-3.5 py-1.5 text-xs font-medium tracking-tight text-emerald-700 backdrop-blur-xl dark:text-emerald-300'
      }
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

function UpcomingBadge({
  target,
  variant,
}: {
  target: Date;
  variant: 'desktop' | 'mobile';
}) {
  const parts = useCountdown(target);

  return (
    <div
      className={
        variant === 'mobile'
          ? 'pointer-events-none absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-white/84 px-4 py-2 text-sm font-medium tracking-tight text-[#111827] shadow-[0_14px_26px_rgba(15,23,42,0.1)] backdrop-blur-xl dark:bg-[#141414]/88 dark:text-white dark:shadow-none'
          : 'pointer-events-none absolute right-5 top-5 z-20 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-tight backdrop-blur-xl text-white'
      }
      aria-label="Contest countdown"
    >
      <Hourglass className={variant === 'mobile' ? 'size-4' : 'size-3'} strokeWidth={2} aria-hidden />
      <span className="whitespace-nowrap tabular-nums">{formatCountdown(parts)}</span>
    </div>
  );
}
