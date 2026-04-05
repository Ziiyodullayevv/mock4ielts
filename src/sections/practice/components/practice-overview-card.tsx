'use client';

import type { PracticeOverview } from '../types';

import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { CircularProgress } from '@/src/components/customized/progress/progress';
import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from '@/src/components/ui/dialog';
import {
  X,
  Zap,
  Mic,
  Star,
  Play,
  Files,
  Share2,
  PenTool,
  Headphones,
  BookOpenText,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

type PracticeOverviewCardProps = {
  className?: string;
  overview: PracticeOverview;
};

const OVERVIEW_THEME = {
  listening: {
    gradient: 'bg-[linear-gradient(145deg,#5f34ad_0%,#8b64ff_100%)]',
    Icon: Headphones,
  },
  reading: {
    gradient: 'bg-[linear-gradient(145deg,#8a4b14_0%,#f0a634_100%)]',
    Icon: BookOpenText,
  },
  writing: {
    gradient: 'bg-[linear-gradient(145deg,#8b2339_0%,#ff7a59_100%)]',
    Icon: PenTool,
  },
  speaking: {
    gradient: 'bg-[linear-gradient(145deg,#0d7c66_0%,#39d0b5_100%)]',
    Icon: Mic,
  },
  'mock-exam': {
    gradient: 'bg-[linear-gradient(145deg,#1a4b92_0%,#4fa8ff_100%)]',
    Icon: Files,
  },
} as const;

export function PracticeOverviewCard({
  className,
  overview,
}: PracticeOverviewCardProps) {
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const solvedRatio =
    overview.totalQuestions > 0 ? (overview.totalSolved / overview.totalQuestions) * 100 : 0;
  const solvedPercent = Math.max(0, Math.min(100, Math.round(solvedRatio)));
  const avgBandScore = overview.avgBandScore ?? 7.5;
  const numberFormatter = new Intl.NumberFormat('en');
  const sectionType = overview.sectionType ?? 'listening';
  const theme = OVERVIEW_THEME[sectionType];
  const OverviewIcon = theme.Icon;
  const summaryText =
    overview.summaryLabel ??
    `${overview.sourceLabel} · ${numberFormatter.format(overview.totalQuestions)} questions`;

  return (
    <>
      <Dialog open={isProgressOpen} onOpenChange={setIsProgressOpen}>
        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-black/60 backdrop-blur-xl"
          className="max-w-[calc(100%-1.75rem)] rounded-[22px] border-0 bg-[#242424] p-0 text-white shadow-[0_24px_80px_rgba(0,0,0,0.42)]"
        >
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-[1.55rem] font-semibold tracking-[-0.04em] text-white sm:text-[1.7rem]">
                  Progress
                </DialogTitle>
              </div>

              <DialogClose className="-mr-1 inline-flex size-10 items-center justify-center rounded-full text-white/68 transition-colors hover:bg-white/6 hover:text-white">
                <X className="size-5" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>

            <DialogDescription className="sr-only">
              Progress summary for {overview.title}
            </DialogDescription>

            <div className="mt-4 rounded-xl bg-white/6 p-4 sm:p-5">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative shrink-0">
                  <CircularProgress
                    value={solvedPercent}
                    size={132}
                    circleStrokeWidth={12}
                    progressStrokeWidth={12}
                    className="stroke-white/16"
                    progressClassName="stroke-[#18c458]"
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

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/42">
                    AVERAGE SCORE
                  </p>
                  <p className="mt-2 whitespace-nowrap text-white">
                    <span className="text-[1.9rem] font-semibold leading-none tracking-[-0.03em]">
                      {avgBandScore.toFixed(1)}
                    </span>
                    <span className="ml-1 text-[1.15rem] leading-none text-white/80">Band</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <aside className={cn('rounded-3xl bg-white/8 p-4 text-sm md:p-5', className)}>
        <div className="md:hidden">
          <div className={cn('mx-auto mt-3 flex size-24 items-center justify-center rounded-2xl', theme.gradient)}>
            <OverviewIcon className="size-[3.25rem] text-white" strokeWidth={2.2} />
          </div>

          <h2 className="mt-5 text-center text-[clamp(2.1rem,7vw,2.55rem)] font-semibold leading-[0.94] tracking-[-0.045em] text-white">
            {overview.title}
          </h2>

          <p className="mt-4 text-center text-base text-white/72">{summaryText}</p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[15px] font-semibold text-black"
            >
              <Play className="size-4 fill-black" strokeWidth={2.2} />
              Practice
            </button>

            <button
              type="button"
              className="grid size-11 place-items-center rounded-full bg-white/8 text-white/78"
              aria-label="Favorite"
            >
              <Star className="size-4" strokeWidth={2} />
            </button>

            <button
              type="button"
              className="grid size-11 place-items-center rounded-full bg-white/8 text-white/78"
              aria-label="Open in new tab"
            >
              <ExternalLink className="size-4" strokeWidth={2} />
            </button>

            <button
              type="button"
              className="grid size-11 place-items-center rounded-full bg-white/8 text-white/78"
              aria-label="Share collection"
            >
              <Share2 className="size-4" strokeWidth={2} />
            </button>
          </div>

          <div className="mt-5 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={() => setIsProgressOpen(true)}
              className="flex min-w-0 items-center justify-between gap-3 text-left text-white transition-colors hover:text-white/88"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="relative shrink-0">
                  <CircularProgress
                    value={solvedPercent}
                    size={24}
                    circleStrokeWidth={3.5}
                    progressStrokeWidth={4.5}
                    className="stroke-white/18"
                    progressClassName="stroke-[#18c458]"
                  />
                </span>
                <span className="truncate text-[1.05rem] font-semibold leading-none tracking-[-0.03em] text-white">
                  {overview.totalSolved}
                </span>
                <span className="truncate text-[0.95rem] text-white/82">Solved</span>
              </div>

              <ChevronRight className="size-5 shrink-0 text-white/54" />
            </button>
          </div>
        </div>

        <div className="hidden md:block">
          <div className={cn('flex size-20 items-center justify-center rounded-xl', theme.gradient)}>
            <div className="relative">
              <span>
                <OverviewIcon className="size-12 text-white" strokeWidth={2.2} />
              </span>
            </div>
          </div>

          <h2 className="mt-5 text-3xl font-semibold leading-[1.02] tracking-[-0.03em] text-white">
            {overview.title}
          </h2>

          <p className="mt-3 text-sm text-white/72">{summaryText}</p>

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
                <CircularProgress
                  value={solvedPercent}
                  size={144}
                  circleStrokeWidth={12}
                  progressStrokeWidth={12}
                  className="stroke-white/16"
                  progressClassName="stroke-[#18c458]"
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
        </div>
      </aside>
    </>
  );
}
