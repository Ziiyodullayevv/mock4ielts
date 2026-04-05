'use client';

import { cn } from '@/src/lib/utils';
import { Squircle } from '@/src/components/squircle/squircle';

type TimerDisplayProps = {
  isReview: boolean;
  totalSeconds: number;
};

export function TimerDisplay({ isReview, totalSeconds }: TimerDisplayProps) {
  if (isReview) {
    return (
      <div className="inline-flex items-center rounded-[24px] bg-[#2c2f36] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-lg sm:rounded-[28px] sm:px-8 sm:py-5 sm:text-sm sm:tracking-[0.18em]">
        Review mode
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
    <Squircle
      n={4}
      radius={28}
      className="inline-grid grid-cols-2 overflow-hidden rounded-xl bg-[#2c2f36] py-1.5 text-white shadow-md sm:py-2"
    >
      {segments.map((segment, index) => (
        <div
          key={segment.label}
          className={cn(
            'flex min-h-10 min-w-[72px] flex-col items-center justify-center text-center sm:min-h-12 sm:min-w-[100px]',
            index > 0 ? 'border-l border-border/10' : ''
          )}
        >
          <div className="text-base font-bold leading-none tracking-[-0.06em] tabular-nums text-white sm:text-lg">
            {String(segment.value).padStart(2, '0')}
          </div>
          <div className="mt-0.5 text-[10px]! font-medium text-white/68 sm:mt-1 sm:text-xs!">
            {segment.label}
          </div>
        </div>
      ))}
    </Squircle>
  );
}
