'use client';

import { ArrowLeft, RotateCcw, ArrowRight } from 'lucide-react';

import { TimerDisplay } from './timer-display';
import GradualBlur from '../../components/GradualBlur';
import { FullscreenToggle } from './fullscreen-toggle';
import { ListeningHeaderAudio } from './listening-header-audio';

type ListeningTestHeaderProps = {
  audioUrl?: string;
  isPrevDisabled: boolean;
  isReview: boolean;
  onPrevPart: () => void;
  onPrimaryAction: () => void;
  primaryActionLabel: string;
  timeLeftSeconds: number;
};

export function ListeningTestHeader({
  audioUrl,
  isPrevDisabled,
  isReview,
  onPrevPart,
  onPrimaryAction,
  primaryActionLabel,
  timeLeftSeconds,
}: ListeningTestHeaderProps) {
  return (
    <header className="sticky top-0 z-100 isolate border-stone-200 bg-linear-to-b from-white from-20% to-transparent to-80%">
      <GradualBlur
        target="parent"
        position="top"
        height="6rem"
        strength={1}
        divCount={2}
        curve="bezier"
        exponential
        opacity={1}
        zIndex={0}
      />
      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3 rounded-full border border-border/20 bg-white p-2 shadow-lg">
          <button
            type="button"
            onClick={onPrevPart}
            disabled={isPrevDisabled}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-border/30 bg-black px-4 text-sm font-medium text-white shadow-md transition-colors hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-black"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <FullscreenToggle />
        </div>

        <div className="flex justify-center">
          <TimerDisplay isReview={isReview} totalSeconds={timeLeftSeconds} />
        </div>

        <div className="ml-auto flex gap-2 rounded-full border border-border/20 bg-white p-2 shadow-lg md:ml-0">
          <ListeningHeaderAudio audioUrl={audioUrl} />

          <button
            type="button"
            onClick={onPrimaryAction}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-stone-900 bg-stone-900 px-5 text-sm font-medium text-white shadow-md transition-colors hover:border-stone-700 hover:bg-stone-700"
          >
            {primaryActionLabel}
            {isReview ? <RotateCcw className="size-4" /> : <ArrowRight className="size-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
