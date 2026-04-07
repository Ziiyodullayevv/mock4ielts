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
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-4 text-white">
      <div
        className={`flex max-w-xl flex-col items-center gap-4 text-center ${
          isMinimalLoadingState
            ? 'px-2 py-4'
            : 'rounded-3xl border border-white/10 bg-white/5 px-8 py-10'
        }`}
      >
        {icon === 'spinner' ? (
          <LoaderCircle className="size-8 animate-spin text-[#ff9f2f]" />
        ) : (
          <PlayCircle className="size-8 text-[#ff9f2f]" />
        )}
        <p className="text-lg font-semibold text-white">{label}</p>
        {description ? <p className="text-sm leading-7 text-white/68">{description}</p> : null}
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0a0a0a]/96 px-6 text-white backdrop-blur-md">
      <h2 className="text-5xl font-semibold tracking-[-0.04em] text-white sm:text-7xl">{value}</h2>
    </div>
  );
}

export function PracticeSubmittingOverlay({
  description = 'Your answers are being submitted and checked.',
  label = 'Calculating your result...',
}: PracticeSubmittingOverlayProps) {
  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center bg-white/72 px-6 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 text-center text-stone-950">
        <LoaderCircle className="size-9 animate-spin text-stone-900" />
        <div className="space-y-1.5">
          <p className="text-lg font-semibold tracking-[-0.02em]">{label}</p>
          <p className="text-sm text-stone-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
