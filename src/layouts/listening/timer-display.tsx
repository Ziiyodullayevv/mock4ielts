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
      <div className="inline-flex items-center rounded-[28px] bg-[#2c2f36] px-8 py-5 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-lg">
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
      className="inline-grid grid-cols-2 overflow-hidden py-2 rounded-xl bg-[#2c2f36] text-white shadow-md"
    >
      {segments.map((segment, index) => (
        <div
          key={segment.label}
          className={cn(
            'min-w-[118px] min-h-12 flex flex-col items-center justify-center text-center sm:min-w-[100px]',
            index > 0 ? 'border-l border-border/10' : ''
          )}
        >
          <div className="text-lg font-bold leading-none tracking-[-0.06em] tabular-nums text-white">
            {String(segment.value).padStart(2, '0')}
          </div>
          <div className="mt-1 text-xs! font-medium text-white/68">{segment.label}</div>
        </div>
      ))}
    </Squircle>
  );
}
