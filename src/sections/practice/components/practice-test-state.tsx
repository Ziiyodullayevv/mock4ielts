'use client';

import { PlayCircle, LoaderCircle } from 'lucide-react';

type PracticePageStateProps = {
  actionLabel?: string;
  description?: string;
  icon?: 'play' | 'spinner';
  label: string;
  onAction?: () => void;
};

type PracticeSubmittingOverlayProps = {
  description?: string;
  label?: string;
};

export function PracticePageState({
  actionLabel,
  description,
  icon = 'spinner',
  label,
  onAction,
}: PracticePageStateProps) {
  const isMinimalLoadingState = icon === 'spinner' && !actionLabel && !description;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 text-stone-950 dark:bg-[#0b0b0b] dark:text-white">
      <div
        className={`flex max-w-xl flex-col items-center gap-4 text-center ${
          isMinimalLoadingState
            ? 'px-2 py-4'
            : 'rounded-3xl border border-stone-200 bg-white/90 px-8 py-10 shadow-[0_18px_44px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5 dark:shadow-none'
        }`}
      >
        {icon === 'spinner' ? (
          <LoaderCircle className="size-8 animate-spin text-[#ff9f2f]" />
        ) : (
          <PlayCircle className="size-8 text-[#ff9f2f]" />
        )}
        <p className="text-lg font-semibold text-stone-950 dark:text-white">{label}</p>
        {description ? (
          <p className="text-sm leading-7 text-stone-600 dark:text-white/68">{description}</p>
        ) : null}
        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            disabled={!onAction}
            className="inline-flex h-11 items-center rounded-full bg-[#ff9f2f] px-5 text-sm font-semibold text-black transition-colors hover:bg-[#ffab44] disabled:cursor-not-allowed disabled:bg-[#ff9f2f]/60"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function PracticeCountdownOverlay({ value }: { value: number }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[radial-gradient(ellipse_104%_64%_at_top_center,rgba(255,179,71,0.20)_0%,rgba(255,179,71,0.10)_42%,transparent_90%),linear-gradient(180deg,rgba(255,248,228,0.96)_0%,rgba(255,253,247,0.96)_54%,rgba(255,255,255,0.96)_100%)] px-6 text-stone-950 backdrop-blur-md dark:bg-[radial-gradient(ellipse_104%_64%_at_top_center,rgba(255,159,47,0.16)_0%,rgba(255,159,47,0.08)_44%,transparent_92%),linear-gradient(180deg,rgba(11,11,9,0.98)_0%,rgba(7,7,7,0.98)_58%,rgba(5,5,5,0.98)_100%)] dark:text-white">
      <h2 className="text-5xl font-semibold tracking-normal text-[#d97706] sm:text-7xl dark:text-[#ff9f2f]">
        {value}
      </h2>
    </div>
  );
}

export function PracticeSubmittingOverlay({
  description = 'Your answers are being submitted and checked.',
  label = 'Calculating your result...',
}: PracticeSubmittingOverlayProps) {
  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center bg-white/72 px-6 backdrop-blur-sm dark:bg-[#0a0a0a]/84">
      <div className="flex flex-col items-center gap-4 text-center text-stone-950 dark:text-white">
        <LoaderCircle className="size-9 animate-spin text-[#ff9f2f]" />
        <div className="space-y-1.5">
          <p className="text-lg font-semibold tracking-[-0.02em] text-stone-950 dark:text-white">
            {label}
          </p>
          <p className="text-sm text-stone-600 dark:text-white/65">{description}</p>
        </div>
      </div>
    </div>
  );
}
