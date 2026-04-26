'use client';

import { cn } from '@/src/lib/utils';
import { AlarmClock } from 'lucide-react';

import { contestIconButtonClassName } from './contest-theme';

type ContestCardFooterProps = {
  title: string;
  startLabel: string;
  showReminder?: boolean;
  onReminderClick?: () => void;
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
              contestIconButtonClassName,
              'pointer-events-auto size-10 shrink-0 text-white/92 hover:text-white after:!bg-white/10 dark:after:!bg-white/8'
            )}
          >
            <AlarmClock className="size-4" strokeWidth={2} aria-hidden />
          </button>
        ) : null}
      </div>
    </>
  );
}
