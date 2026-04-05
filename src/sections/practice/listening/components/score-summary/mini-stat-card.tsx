'use client';

import { CircularProgress } from '@/src/components/customized/progress/progress';

import { MINI_CARD_CIRCLE_STROKE, MINI_CARD_PROGRESS_STROKE } from './constants';

type MiniStatCardProps = {
  accent: string;
  detail: string;
  label: string;
  percentage: number;
  value: string;
};

export function MiniStatCard({ accent, detail, label, percentage }: MiniStatCardProps) {
  return (
    <div className="rounded-2xl bg-white/6 p-5">
      <div className="flex h-full items-center justify-center gap-3">
        <div className="relative shrink-0">
          <CircularProgress
            value={percentage}
            size={104}
            circleStrokeWidth={MINI_CARD_CIRCLE_STROKE}
            progressStrokeWidth={MINI_CARD_PROGRESS_STROKE}
            className="stroke-white/10"
            progressStyle={{
              filter: `drop-shadow(0 0 8px ${accent}33)`,
              stroke: accent,
            }}
          />

          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="text-base font-semibold tracking-[-0.04em] text-white">
              {percentage}%
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-base text-white/66">{label}</p>
          <p className="text-sm leading-6 text-white/44">{detail}</p>
        </div>
      </div>
    </div>
  );
}
