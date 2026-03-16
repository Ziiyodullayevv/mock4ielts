import type { PracticeOverview } from '../types';

import { cn } from '@/src/lib/utils';
import { ProgressBar } from '@/src/components/nurui/progress-bar';
import { Zap, Star, Play, Share2, Headphones, ExternalLink } from 'lucide-react';

type PracticeOverviewCardProps = {
  className?: string;
  overview: PracticeOverview;
};

export function PracticeOverviewCard({
  className,
  overview,
}: PracticeOverviewCardProps) {
  const solvedRatio =
    overview.totalQuestions > 0 ? (overview.totalSolved / overview.totalQuestions) * 100 : 0;
  const solvedPercent = Math.max(0, Math.min(100, Math.round(solvedRatio)));
  const avgBandScore = overview.avgBandScore ?? 7.5;
  const numberFormatter = new Intl.NumberFormat('en');

  return (
    <aside className={cn('rounded-3xl bg-white/8 p-5 text-sm', className)}>
      <div className="flex size-20 items-center justify-center rounded-xl bg-[linear-gradient(145deg,#5f34ad_0%,#8b64ff_100%)]">
        <div className="relative">
          <span>
            <Headphones className="size-12 text-white" strokeWidth={2.2} />
          </span>
        </div>
      </div>

      <h2 className="mt-5 text-3xl font-semibold leading-[1.02] tracking-[-0.03em] text-white">
        {overview.title}
      </h2>

      <p className="mt-3 text-sm text-white/72">
        {overview.sourceLabel} · {numberFormatter.format(overview.totalQuestions)} questions
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black"
        >
          <Play className="size-4 fill-black" strokeWidth={2.2} />
          Practice
        </button>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-full bg-white/8 text-white/78"
          aria-label="Favorite"
        >
          <Star className="size-4" strokeWidth={2} />
        </button>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-full bg-white/8 text-white/78"
          aria-label="Open in new tab"
        >
          <ExternalLink className="size-4" strokeWidth={2} />
        </button>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-full bg-white/8 text-white/78"
          aria-label="Share collection"
        >
          <Share2 className="size-4" strokeWidth={2} />
        </button>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-white/72">
        <Zap className="size-4 text-white/72" strokeWidth={2} />
        <span>Updated: {overview.updatedAtLabel}</span>
      </div>

      <div className="my-6 h-px bg-white/10" />

      <div className="mt-3 rounded-2xl bg-white/6 p-4 sm:p-5">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
          <div className="relative shrink-0">
            <ProgressBar
              max={100}
              min={0}
              value={solvedPercent}
              gaugePrimaryColor="#18c458"
              gaugeSecondaryColor="rgba(255,255,255,0.18)"
              className="size-36 [&>span]:hidden"
            />

            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <span className="block text-2xl font-semibold leading-none tracking-[-0.03em] text-white">
                  {overview.totalSolved}
                  <span className="text-sm opacity-70"> / {overview.totalQuestions}</span>
                </span>
                <span className="block text-xs leading-none tracking-[0.08em] text-white/55">
                  Completed
                </span>
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-4 sm:gap-8">
            <div>
              <p className="text-xs font-semibold tracking-xs text-white/42 uppercase">
                AVERAGE SCORE
              </p>
              <p className="mt-2 text-white">
                <span className="text-2xl font-semibold leading-none tracking-[-0.03em]">
                  {avgBandScore.toFixed(1)}
                </span>
                <span className="ml-1 text-base leading-none text-white/80">Band</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
