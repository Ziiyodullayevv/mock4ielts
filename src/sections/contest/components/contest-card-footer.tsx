'use client';

import type { MouseEvent } from 'react';

import { cn } from '@/src/lib/utils';
import { AlarmClock } from 'lucide-react';

import { useCountdown } from '../hooks';
import { formatClockCountdown } from '../utils';
import { contestIconButtonClassName } from './contest-theme';

type ContestCardFooterProps = {
  startsAt: Date;
  title: string;
  startLabel: string;
  showReminder?: boolean;
  onReminderClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function ContestCardFooter({
  startsAt,
  title,
  startLabel,
  showReminder = false,
  onReminderClick,
}: ContestCardFooterProps) {
  const countdown = useCountdown(startsAt);

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-18" />
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between px-8 py-7">
        <div className="pointer-events-none">
          <p className="text-base font-semibold text-white text-shadow-sm tracking-tight">
            {title}
          </p>
          <p className="mt-0.5 text-xs text-shadow-sm text-white/70">{startLabel}</p>
        </div>
        {showReminder ? (
          <button
            type="button"
            onClick={onReminderClick}
            aria-label="Set reminder"
            className={cn(
              contestIconButtonClassName,
              'pointer-events-auto h-10 shrink-0 gap-2 px-3 text-xs font-semibold tabular-nums text-white/92 hover:text-white after:!bg-white/10 dark:after:!bg-white/8'
            )}
          >
            <AlarmClock className="size-4" strokeWidth={2} aria-hidden />
            <span>{formatClockCountdown(countdown)}</span>
          </button>
        ) : null}
      </div>
    </>
  );
}
