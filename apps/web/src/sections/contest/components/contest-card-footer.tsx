'use client';

import type { MouseEvent } from 'react';

import { cn } from '@/src/lib/utils';
import { AlarmClock } from 'lucide-react';

type ContestCardFooterProps = {
  title: string;
  startLabel: string;
  showReminder?: boolean;
  onReminderClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function ContestCardFooter({
  title,
  startLabel,
  showReminder = false,
  onReminderClick,
}: ContestCardFooterProps) {
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
              'pointer-events-auto grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white shadow-none backdrop-blur-xl transition-colors hover:bg-white/16 hover:text-white'
            )}
          >
            <AlarmClock className="size-4" strokeWidth={2} aria-hidden />
          </button>
        ) : null}
      </div>
    </>
  );
}
