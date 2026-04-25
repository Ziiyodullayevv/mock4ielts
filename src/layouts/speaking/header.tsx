'use client';

import { cn } from '@/src/lib/utils';
import { Slider } from '@/src/components/ui/slider';
import { useRef, useState, useEffect, useCallback } from 'react';
import { TimerDisplay } from '@/src/layouts/listening/timer-display';
import {
  LogOut,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { PRACTICE_HEADER_RING_CLASS } from '@/src/layouts/practice-surface-theme';

import GradualBlur from '../../components/GradualBlur';
import { ListeningHeaderMoreMenu, ListeningHeaderFullscreenButton } from '../listening/header-more-menu';

type SpeakingTestHeaderProps = {
  onExit: () => void;
  timeLeftSeconds: number;
};

export function SpeakingTestHeader({
  onExit,
  timeLeftSeconds,
}: SpeakingTestHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isAudioExpanded, setIsAudioExpanded] = useState(false);

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
    <header className="sticky top-0 z-40 isolate border-stone-200 bg-linear-to-b from-white from-20% to-transparent to-80% dark:border-white/10 dark:bg-linear-to-b dark:from-background dark:from-20% dark:to-transparent dark:to-80%">
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

      <div className="relative z-10 flex min-h-16 w-full items-center justify-between gap-3 px-4 py-2.5 sm:hidden">
        <ExitButton onExit={onExit} />

        <div className="flex h-full min-w-0 flex-1 items-center self-center">
          <div className="flex w-full items-center justify-center">
            <TimerDisplay isReview={false} totalSeconds={timeLeftSeconds} />
          </div>
        </div>

        <div className="flex h-full shrink-0 self-center items-center gap-2">
          <div
            className={cn(
              'flex items-center rounded-full p-1 shadow-lg dark:shadow-none',
              PRACTICE_HEADER_RING_CLASS
            )}
          >
            <SpeakingHeaderInlineAudioMenu
              volume={volume}
              onVolumeChange={setVolume}
              onExpandedChange={setIsAudioExpanded}
            />

            <span
              className={cn(
                'mx-0.5 h-6 w-px bg-stone-200 dark:bg-white/12',
                isAudioExpanded && 'hidden'
              )}
            />

            <ListeningHeaderFullscreenButton />
          </div>

          <div
            className={cn(
              'flex items-center rounded-full p-1 shadow-lg dark:shadow-none',
              PRACTICE_HEADER_RING_CLASS
            )}
          >
            <ListeningHeaderMoreMenu />
          </div>
        </div>
      </div>

      <div className="relative z-10 hidden min-h-[72px] w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 py-2.5 sm:grid sm:px-6">
        <div className="flex h-full -translate-y-1 items-center justify-self-start">
          <ExitButton onExit={onExit} />
        </div>

        <div className="flex h-full items-center self-center justify-center">
          <TimerDisplay isReview={false} totalSeconds={timeLeftSeconds} />
        </div>

        <div className="flex h-full -translate-y-1 self-center items-center justify-self-end gap-2">
          <div
            className={cn(
              'group flex items-center rounded-full p-1 transition-shadow',
              PRACTICE_HEADER_RING_CLASS,
              isScrolled
                ? 'shadow-[0_14px_30px_rgba(15,23,42,0.16),0_4px_14px_rgba(15,23,42,0.1)] dark:shadow-none'
                : 'shadow-lg dark:shadow-none'
            )}
          >
            <SpeakingHeaderInlineAudioMenu
              volume={volume}
              onVolumeChange={setVolume}
              onExpandedChange={setIsAudioExpanded}
            />

            <span
              className={cn(
                'mx-0.5 h-7 w-px bg-stone-200 transition-opacity group-hover:opacity-0 dark:bg-white/12',
                isAudioExpanded && 'hidden'
              )}
            />

            <ListeningHeaderFullscreenButton />
          </div>

          <div
            className={cn(
              'flex items-center rounded-full p-1 transition-shadow',
              PRACTICE_HEADER_RING_CLASS,
              isScrolled
                ? 'shadow-[0_14px_30px_rgba(15,23,42,0.16),0_4px_14px_rgba(15,23,42,0.1)] dark:shadow-none'
                : 'shadow-lg dark:shadow-none'
            )}
          >
            <ListeningHeaderMoreMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

type SpeakingHeaderInlineAudioMenuProps = {
  onExpandedChange?: (isExpanded: boolean) => void;
  onVolumeChange: (value: number) => void;
  volume: number;
};

function SpeakingHeaderInlineAudioMenu({
  volume,
  onVolumeChange,
  onExpandedChange,
}: SpeakingHeaderInlineAudioMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const TriggerIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  const updateExpandedState = useCallback(
    (nextValue: boolean) => {
      setIsExpanded(nextValue);
      onExpandedChange?.(nextValue);
    },
    [onExpandedChange]
  );

  useEffect(() => {
    if (!isExpanded) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (shellRef.current?.contains(event.target as Node)) {
        return;
      }

      updateExpandedState(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        updateExpandedState(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded, updateExpandedState]);

  useEffect(() => {
    if (!isExpanded) {
      return undefined;
    }

    const closeTimer = window.setTimeout(() => {
      updateExpandedState(false);
    }, 4000);

    return () => window.clearTimeout(closeTimer);
  }, [isExpanded, updateExpandedState, volume]);

  return (
    <div
      ref={shellRef}
      className={cn(
        'relative flex h-9 shrink-0 items-center overflow-hidden rounded-full transition-[width] duration-300 ease-out',
        isExpanded ? 'w-[138px]' : 'w-10'
      )}
    >
      <button
        type="button"
        aria-label="Open audio controls"
        aria-expanded={isExpanded}
        onClick={() => updateExpandedState(true)}
        className={cn(
          'absolute inset-0 inline-flex h-9 w-10 shrink-0 items-center justify-center rounded-full text-stone-700 transition-all duration-200 hover:bg-stone-100 hover:text-stone-900 dark:text-white/78 dark:hover:bg-white/8 dark:hover:text-white',
          isExpanded
            ? 'invisible pointer-events-none translate-x-2 opacity-0'
            : 'visible opacity-100'
        )}
      >
        <TriggerIcon className="size-4.5" strokeWidth={2} />
      </button>

      <div
        className={cn(
          'flex h-full w-full items-center gap-1 rounded-full bg-stone-100/95 pl-3 pr-1.5 text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all duration-200 dark:bg-white/8 dark:text-white dark:shadow-none',
          isExpanded
            ? 'visible translate-x-0 opacity-100'
            : 'invisible pointer-events-none translate-x-4 opacity-0'
        )}
      >
        <Slider
          value={[volume]}
          max={100}
          step={1}
          onValueChange={(nextValue) => onVolumeChange(nextValue[0] ?? 0)}
          aria-label="Audio volume"
          className="w-[88px] shrink-0 [&_[data-slot=slider-range]]:bg-stone-950 [&_[data-slot=slider-thumb]]:size-0 [&_[data-slot=slider-thumb]]:border-0 [&_[data-slot=slider-thumb]]:bg-transparent [&_[data-slot=slider-thumb]]:opacity-0 [&_[data-slot=slider-thumb]]:shadow-none [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-track]]:bg-stone-300 dark:[&_[data-slot=slider-range]]:bg-white dark:[&_[data-slot=slider-track]]:bg-white/18"
        />

        <button
          type="button"
          onClick={() => onVolumeChange(volume === 0 ? 80 : 0)}
          aria-label={volume === 0 ? 'Unmute audio' : 'Mute audio'}
          title={volume === 0 ? 'Unmute audio' : 'Mute audio'}
          className="inline-flex size-6 shrink-0 items-center justify-center text-stone-700 transition-colors hover:text-stone-950 dark:text-white/78 dark:hover:text-white"
        >
          <TriggerIcon className="size-4.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function ExitButton({ onExit }: { onExit: () => void }) {
  return (
    <div className={cn('inline-flex w-fit shrink-0 items-center rounded-full', PRACTICE_HEADER_RING_CLASS)}>
      <button
        type="button"
        onClick={onExit}
        aria-label="Exit test"
        className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-[#ef4444] bg-[linear-gradient(135deg,#ff6b6b_0%,#ef4444_52%,#dc2626_100%)] px-5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(239,68,68,0.28)] transition-all hover:brightness-105"
      >
        <LogOut className="size-4" strokeWidth={2} />
        <span>Exit</span>
      </button>
    </div>
  );
}
