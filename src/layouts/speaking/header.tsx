'use client';

import { cn } from '@/src/lib/utils';
import { useState, useEffect } from 'react';
import { Slider } from '@/src/components/ui/slider';
import { TimerDisplay } from '@/src/layouts/listening/timer-display';
import {
  Volume1,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';

import GradualBlur from '../../components/GradualBlur';
import { ListeningHeaderMoreMenu, ListeningHeaderFullscreenButton } from '../listening/header-more-menu';

type SpeakingTestHeaderProps = {
  isPrimaryActionDisabled?: boolean;
  isPrevDisabled?: boolean;
  onPrevPart: () => void;
  onPrimaryAction: () => void;
  prevActionLabel?: string;
  primaryActionLabel?: string;
  timeLeftSeconds: number;
};

export function SpeakingTestHeader({
  isPrimaryActionDisabled = false,
  isPrevDisabled = false,
  onPrevPart,
  onPrimaryAction,
  prevActionLabel = 'Prev',
  primaryActionLabel = 'Next',
  timeLeftSeconds,
}: SpeakingTestHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [volume, setVolume] = useState(80);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 6);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 isolate border-stone-200 bg-linear-to-b from-white from-20% to-transparent to-80%">
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

      <div className="relative z-10 mx-auto flex w-full max-w-[1480px] items-center justify-between gap-3 px-4 py-2.5 sm:hidden">
        <div className="flex shrink-0 items-center rounded-full border border-border/30 bg-white/95 p-1 shadow-lg">
          <button
            type="button"
            onClick={onPrevPart}
            disabled={isPrevDisabled}
            aria-label={prevActionLabel}
            className="inline-flex size-9 items-center justify-center rounded-full text-stone-800 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300"
          >
            <ChevronLeft className="size-4.5" strokeWidth={2} />
          </button>

          <span className="mx-0.5 h-6 w-px bg-stone-200" />

          <button
            type="button"
            onClick={onPrimaryAction}
            disabled={isPrimaryActionDisabled}
            aria-label={primaryActionLabel}
            className="inline-flex size-9 items-center justify-center rounded-full text-stone-800 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300"
          >
            <ChevronRight className="size-4.5" strokeWidth={2} />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex justify-center">
            <TimerDisplay isReview={false} totalSeconds={timeLeftSeconds} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center rounded-full border border-border/30 bg-white/95 p-1 shadow-lg">
            <SpeakingHeaderAudioMenu volume={volume} onVolumeChange={setVolume} />

            <span className="mx-0.5 h-6 w-px bg-stone-200" />

            <ListeningHeaderFullscreenButton />
          </div>

          <div className="flex items-center rounded-full border border-border/30 bg-white/95 p-1 shadow-lg">
            <ListeningHeaderMoreMenu />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto hidden w-full max-w-[1480px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 py-2.5 sm:grid sm:px-6">
        <div
          className={cn(
            'group justify-self-start flex items-center rounded-full border border-border/40 bg-white/95 p-1 transition-shadow',
            isScrolled
              ? 'shadow-[0_14px_30px_rgba(15,23,42,0.16),0_4px_14px_rgba(15,23,42,0.1)]'
              : 'shadow-lg'
          )}
        >
          <button
            type="button"
            onClick={onPrevPart}
            disabled={isPrevDisabled}
            title={prevActionLabel}
            className="inline-flex h-9 w-10 shrink-0 items-center justify-center rounded-full text-stone-800 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="size-5" strokeWidth={1.9} />
          </button>

          <span className="mx-0.5 h-7 w-px bg-stone-200 transition-opacity group-hover:opacity-0" />

          <button
            type="button"
            onClick={onPrimaryAction}
            disabled={isPrimaryActionDisabled}
            aria-label={primaryActionLabel}
            title={primaryActionLabel}
            className="inline-flex h-9 w-10 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-transparent"
          >
            <ChevronRight className="size-5" strokeWidth={1.9} />
          </button>
        </div>

        <div className="flex justify-center">
          <TimerDisplay isReview={false} totalSeconds={timeLeftSeconds} />
        </div>

        <div className="flex items-center justify-self-end gap-2">
          <div
            className={cn(
              'group flex items-center rounded-full border border-border/20 bg-white p-1 transition-shadow',
              isScrolled
                ? 'shadow-[0_14px_30px_rgba(15,23,42,0.16),0_4px_14px_rgba(15,23,42,0.1)]'
                : 'shadow-lg'
            )}
          >
            <SpeakingHeaderAudioMenu volume={volume} onVolumeChange={setVolume} />

            <span className="mx-0.5 h-7 w-px bg-stone-200 transition-opacity group-hover:opacity-0" />

            <ListeningHeaderFullscreenButton />
          </div>

          <div
            className={cn(
              'flex items-center rounded-full border border-border/20 bg-white p-1 transition-shadow',
              isScrolled
                ? 'shadow-[0_14px_30px_rgba(15,23,42,0.16),0_4px_14px_rgba(15,23,42,0.1)]'
                : 'shadow-lg'
            )}
          >
            <ListeningHeaderMoreMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

function SpeakingHeaderAudioMenu({
  volume,
  onVolumeChange,
}: {
  onVolumeChange: (value: number) => void;
  volume: number;
}) {
  const TriggerIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open audio controls"
          className="inline-flex h-9 w-10 shrink-0 items-center justify-center rounded-full text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900"
        >
          <TriggerIcon className="size-4.5" strokeWidth={2} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        forceMount
        align="end"
        sideOffset={10}
        className="w-72 rounded-2xl border border-stone-200 bg-white p-3 text-stone-900 shadow-[0_20px_40px_rgba(15,23,42,0.18)]"
      >
        <SpeakingHeaderAudioControls volume={volume} onVolumeChange={onVolumeChange} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SpeakingHeaderAudioControls({
  mobile = false,
  volume,
  onVolumeChange,
}: {
  mobile?: boolean;
  onVolumeChange: (value: number) => void;
  volume: number;
}) {
  const LeadingVolumeIcon = volume === 0 ? VolumeX : Volume1;

  return (
    <div className={cn('flex shrink-0 items-center', mobile ? 'w-full' : 'w-[230px]')}>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={() => onVolumeChange(volume === 0 ? 80 : 0)}
          className={cn(
            'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900',
            mobile ? 'h-9 w-9' : ''
          )}
          aria-label={volume === 0 ? 'Unmute audio' : 'Mute audio'}
        >
          <LeadingVolumeIcon className={cn(mobile ? 'size-5' : 'size-4.5')} strokeWidth={2.2} />
        </button>

        <Slider
          value={[volume]}
          max={100}
          step={1}
          onValueChange={(nextValue) => onVolumeChange(nextValue[0] ?? 0)}
          aria-label="Audio volume"
          className="min-w-0 flex-1 [&_[data-slot=slider-range]]:bg-stone-400 [&_[data-slot=slider-thumb]]:border-stone-800 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:shadow-[0_8px_18px_rgba(15,23,42,0.18)] [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-track]]:bg-stone-200 [&_[data-slot=slider-track]]:h-2"
        />

        <button
          type="button"
          onClick={() => onVolumeChange(100)}
          className={cn(
            'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900',
            mobile ? 'h-9 w-9' : ''
          )}
          aria-label="Set audio volume to maximum"
        >
          <Volume2 className={cn(mobile ? 'size-5' : 'size-4.5')} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
