'use client';

import { cn } from '@/src/lib/utils';
import { Squircle } from '@/src/components/squircle/squircle';
import { PRACTICE_TIMER_RING_CLASS } from '@/src/layouts/practice-surface-theme';

type TimerDisplayProps = {
  isReview: boolean;
  totalSeconds: number;
};

export function TimerDisplay({ isReview, totalSeconds }: TimerDisplayProps) {
  if (isReview) {
    return (
      <div className="inline-flex [filter:drop-shadow(0_8px_18px_rgba(15,23,42,0.08))_drop-shadow(0_2px_8px_rgba(15,23,42,0.04))] dark:[filter:none]">
        <div
          className={cn(
            'inline-flex items-center rounded-[24px] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-900 sm:rounded-[28px] sm:px-8 sm:py-5 sm:text-sm sm:tracking-[0.18em] dark:text-white',
            PRACTICE_TIMER_RING_CLASS
          )}
        >
          <span>Review mode</span>
        </div>
      </div>
    );
  }

  const safeTotalSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeTotalSeconds / 60);
  const seconds = safeTotalSeconds % 60;
  const segments = [
    { label: 'Minutes', value: minutes },
    { label: 'Seconds', value: seconds },
  ];

  return (
    <div className="inline-block [filter:drop-shadow(0_8px_18px_rgba(15,23,42,0.08))_drop-shadow(0_2px_8px_rgba(15,23,42,0.04))] dark:[filter:none]">
      <div className={cn('inline-block rounded-xl', PRACTICE_TIMER_RING_CLASS)}>
        <Squircle
          n={4}
          radius={28}
          className="inline-grid grid-cols-2 overflow-hidden rounded-xl bg-transparent py-1.5 text-stone-900 sm:py-2 dark:text-white"
        >
          {segments.map((segment, index) => (
            <div
              key={segment.label}
              className={cn(
                'flex min-h-10 min-w-[72px] flex-col items-center justify-center text-center sm:min-h-12 sm:min-w-[100px]',
                index > 0
                  ? 'relative before:absolute before:inset-y-2 before:left-0 before:w-px before:bg-black/6 dark:before:bg-white/6'
                  : ''
              )}
            >
              <div className="text-base font-bold leading-none tracking-[-0.06em] tabular-nums text-stone-900 sm:text-lg dark:text-white">
                {String(segment.value).padStart(2, '0')}
              </div>
              <div className="mt-0.5 text-[10px]! font-medium text-stone-500 sm:mt-1 sm:text-xs! dark:text-white/68">
                {segment.label}
              </div>
            </div>
          ))}
        </Squircle>
      </div>
    </div>
  );
}
