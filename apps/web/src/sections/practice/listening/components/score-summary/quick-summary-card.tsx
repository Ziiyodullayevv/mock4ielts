'use client';

import type { ScoreSummaryViewModel } from './types';

import { SUMMARY_CARD_GLOW } from './constants';

type QuickSummaryCardProps = {
  viewModel: ScoreSummaryViewModel;
};

export function QuickSummaryCard({ viewModel }: QuickSummaryCardProps) {
  return (
    <section className="rounded-2xl bg-linear-to-t from-red-600 to-red-500  p-5 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-2xl font-bold text-white/76">Quick summary</p>
          <p
            className="mt-7 text-7xl font-semibold tracking-[-0.07em] text-white"
            style={{ filter: SUMMARY_CARD_GLOW }}
          >
            {viewModel.displayBand}
          </p>
          <p className="mt-2 text-xl font-semibold uppercase text-white">Band score</p>
        </div>
      </div>

      <p className="mt-6 text-sm text-white/56">
        Use the review action above to inspect mistakes in detail.
      </p>
    </section>
  );
}
