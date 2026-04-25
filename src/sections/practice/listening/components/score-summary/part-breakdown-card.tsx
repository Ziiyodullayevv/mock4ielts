'use client';

import type { PartTone, PartMetric, ScoreSummaryViewModel } from './types';

import { motion } from 'motion/react';
import { PRACTICE_CARD_RING_GRAY_CLASS } from '@/src/layouts/practice-surface-theme';

import { PART_TONES } from './constants';

type PartBreakdownCardProps = {
  viewModel: ScoreSummaryViewModel;
};

export function PartBreakdownCard({ viewModel }: PartBreakdownCardProps) {
  return (
    <section className={`rounded-2xl p-5 ${PRACTICE_CARD_RING_GRAY_CLASS}`}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-[1.45rem] font-semibold tracking-[-0.04em] text-stone-900 dark:text-white">
          Part breakdown
        </h3>
      </div>

      <div className="mt-5 space-y-5">
        {viewModel.partMetrics.length ? (
          viewModel.partMetrics.map((part, index) => (
            <PartBreakdownRow
              key={part.partNumber}
              part={part}
              tone={PART_TONES[index % PART_TONES.length]}
            />
          ))
        ) : (
          <div className="rounded-2xl bg-black/4 px-4 py-5 text-sm text-stone-500 dark:bg-white/6 dark:text-white/56">
            Part breakdown is not available for this attempt yet.
          </div>
        )}
      </div>
    </section>
  );
}

function PartBreakdownRow({ part, tone }: { part: PartMetric; tone: PartTone }) {
  const safePercentage = Math.max(0, Math.min(100, part.percentage));

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold capitalize tracking-[0.01em] text-stone-900 dark:text-white">
          Part {part.partNumber}
        </p>

        <p className="text-right text-sm font-semibold tracking-[-0.02em] text-stone-900 dark:text-white">
          {part.score}/{part.total}
        </p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-black/8 dark:bg-white/8">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safePercentage}%` }}
          transition={{ duration: 0.48, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundImage: tone.gradient }}
        />
      </div>
    </div>
  );
}
