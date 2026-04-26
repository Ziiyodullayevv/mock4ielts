'use client';

import type { LucideIcon } from 'lucide-react';

import { PRACTICE_CARD_RING_GRAY_CLASS } from '@/src/layouts/practice-surface-theme';

type SummaryMetricCardProps = {
  accentClassName: string;
  detail: string;
  icon: LucideIcon;
  label: string;
  value: string;
};

export function SummaryMetricCard({
  accentClassName,
  detail,
  icon: Icon,
  label,
  value,
}: SummaryMetricCardProps) {
  return (
    <div className={`flex min-h-41 flex-col items-start rounded-2xl p-6 ${PRACTICE_CARD_RING_GRAY_CLASS}`}>
      <div className={`rounded-2xl bg-black/4 p-3 dark:bg-white/5 ${accentClassName}`}>
        <Icon className="size-6" />
      </div>

      <div className="mt-4 flex flex-col">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500 dark:text-white/46">{label}</p>
      </div>

      <div>
        <p className="mt-4 whitespace-nowrap text-[2rem] font-semibold tracking-[-0.05em] text-stone-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}
