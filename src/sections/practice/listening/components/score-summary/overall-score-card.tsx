'use client';

import type { ScoreSummaryViewModel } from './types';

import { motion } from 'motion/react';
import { CircularProgress } from '@/src/components/customized/progress/progress';
import { PRACTICE_CARD_RING_GRAY_CLASS } from '@/src/layouts/practice-surface-theme';

import { SHARED_CIRCLE_STROKE, SHARED_PROGRESS_STROKE } from './constants';

type OverallScoreCardProps = {
  viewModel: ScoreSummaryViewModel;
};

export function OverallScoreCard({ viewModel }: OverallScoreCardProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: 'easeOut', delay: 0.04 }}
      className={`flex flex-col rounded-2xl p-5 ${PRACTICE_CARD_RING_GRAY_CLASS}`}
    >
      <p className="text-[1.45rem] font-semibold tracking-[-0.04em] text-stone-900 dark:text-white">Overall score</p>

      <div className="mt-4 flex flex-1 items-center justify-center">
        <div className="relative">
          <CircularProgress
            value={viewModel.accuracy}
            size={288}
            circleStrokeWidth={SHARED_CIRCLE_STROKE}
            progressStrokeWidth={SHARED_PROGRESS_STROKE}
            className="stroke-black/8 dark:stroke-white/10"
            progressStyle={{
              filter: viewModel.theme.glow,
              stroke: viewModel.theme.ring,
            }}
          />

          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="font-semibold leading-none text-stone-900 dark:text-white">
                <span className="text-6xl">{viewModel.score}</span>
                <span className="text-xl opacity-50"> / {viewModel.total}</span>
              </div>
              <p className="mt-1 text-xs font-medium capitalize tracking-[0.08em] text-stone-500 dark:text-white/50">
                Correct answers
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-4 pt-4">
        <LegendRow
          accent={viewModel.theme.ring}
          label="Correct"
          value={`${viewModel.score} answers`}
        />
        <LegendRow
          accent="rgba(255,255,255,0.14)"
          label="Need review"
          value={`${viewModel.remainingCount} answers`}
        />
      </div>
    </motion.aside>
  );
}

function LegendRow({ accent, label, value }: { accent: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span
          className="size-4 rounded-full"
          style={{
            background: accent,
            boxShadow: accent.startsWith('rgba') ? 'none' : `0 0 18px ${accent}55`,
          }}
        />
        <span className="text-base text-stone-600 dark:text-white/62">{label}</span>
      </div>

      <span className="text-base font-semibold tracking-[-0.03em] text-stone-900 dark:text-white">{value}</span>
    </div>
  );
}
