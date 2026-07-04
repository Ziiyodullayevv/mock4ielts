/* eslint-disable react-hooks/refs */

'use client';

import type { PracticeTextSize } from '@/src/sections/practice/shared/practice-text-size';

import { cn } from '@/src/lib/utils';
import { Slider } from '@/src/components/ui/slider';
import { useRef, useState, useEffect, useCallback } from 'react';
import { PracticeTextSizeSlider } from '@/src/layouts/practice/practice-text-size-slider';
import { PRACTICE_HEADER_ACTIVE_BUTTON_CLASS } from '@/src/layouts/practice-footer-theme';
import { PracticeHeaderNotesButton, LISTENING_OPEN_NOTES_EVENT } from '@/src/layouts/practice';
import { PracticeHeaderShareButton } from '@/src/layouts/practice/practice-header-share-button';
import {
  PRACTICE_HEADER_RING_CLASS,
  PRACTICE_MENU_PANEL_RING_CLASS,
} from '@/src/layouts/practice-surface-theme';
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import {
  PracticeHeaderMenuQuickActions,
  PracticeHeaderMenuQuickActionShell,
} from '@/src/layouts/practice/practice-header-menu-section';
import {
  Play,
  Pause,
  Rewind,
  Volume1,
  Volume2,
  VolumeX,
  RotateCcw,
  PencilLine,
  Headphones,
  FastForward,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
} from 'lucide-react';

import { TimerDisplay } from './timer-display';
import GradualBlur from '../../components/GradualBlur';
import { ListeningHeaderAudio } from './listening-header-audio';
import { useListeningHeaderAudio } from './use-listening-header-audio';
import { ListeningHeaderMoreMenu, ListeningHeaderFullscreenButton } from './header-more-menu';

type ListeningTestHeaderProps = {
  audioUrl?: string;
  isPrimaryActionDisabled?: boolean;
  isPrevDisabled: boolean;
  isReview: boolean;
  isSubmitAction?: boolean;
  onLogoClick?: () => void;
  onPrevPart: () => void;
  onPrimaryAction: () => void;
  onAudioTimeChange?: (currentTime: number) => void;
  onTextSizeChange: (textSize: PracticeTextSize) => void;
  prevActionLabel?: string;
  primaryActionLabel: string;
  textSize: PracticeTextSize;
  timeLeftSeconds: number;
};

type ListeningHeaderControl = 'audio' | 'fullscreen' | 'notes' | 'theme' | null;

const LISTENING_DESKTOP_HELP_ITEMS = [
  {
    description: 'Save quick reminders, keywords, and distractors in the Notes panel.',
    icon: PencilLine,
    title: 'Notes',
  },
  {
    description: 'Use the audio controls to adjust volume while you listen.',
    icon: Headphones,
    title: 'Audio',
  },
] as const;

export function ListeningTestHeader({
  audioUrl,
  isPrimaryActionDisabled = false,
  isPrevDisabled,
  isReview,
  isSubmitAction = false,
  onLogoClick,
  onPrevPart,
  onPrimaryAction,
  onAudioTimeChange,
  onTextSizeChange,
  prevActionLabel = 'Prev',
  primaryActionLabel,
  textSize,
  timeLeftSeconds,
}: ListeningTestHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredHeaderControl, setHoveredHeaderControl] = useState<ListeningHeaderControl>(null);
  const [isAudioMenuExpanded, setIsAudioMenuExpanded] = useState(false);
  const audioControls = useListeningHeaderAudio(audioUrl, {
    autoPlay: !isReview,
    lockPlayback: !isReview,
  });
  const isExitAction = isPrevDisabled && Boolean(onLogoClick);
  const headerShellShadowClass = isScrolled
    ? 'shadow-[0_12px_26px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] dark:shadow-none'
    : 'shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-none';
  const effectiveHoveredHeaderControl = isAudioMenuExpanded ? 'audio' : hoveredHeaderControl;
  const isAudioDividerHidden =
    effectiveHoveredHeaderControl === 'audio' || effectiveHoveredHeaderControl === 'fullscreen';
  const isFullscreenDividerHidden =
    effectiveHoveredHeaderControl === 'fullscreen' || effectiveHoveredHeaderControl === 'notes';
  const isNotesDividerHidden =
    effectiveHoveredHeaderControl === 'notes' || effectiveHoveredHeaderControl === 'theme';

  const createHeaderControlHandlers = (control: Exclude<ListeningHeaderControl, null>) => ({
    onBlurCapture: (event: React.FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        setHoveredHeaderControl((currentValue) => (currentValue === control ? null : currentValue));
      }
    },
    onFocusCapture: () => {
      setHoveredHeaderControl(control);
    },
    onMouseEnter: () => {
      setHoveredHeaderControl(control);
    },
    onMouseLeave: () => {
      setHoveredHeaderControl((currentValue) => (currentValue === control ? null : currentValue));
    },
  });

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

  useEffect(() => {
    onAudioTimeChange?.(audioControls.currentTime);
  }, [audioControls.currentTime, onAudioTimeChange]);

  return (
    <header className="sticky top-0 z-40 isolate border-stone-200 bg-linear-to-b from-white from-20% to-transparent to-80% dark:border-white/10 dark:bg-linear-to-b dark:from-background dark:from-20% dark:to-transparent dark:to-80%">
      {audioUrl ? (
        <audio
          ref={audioControls.audioRef}
          autoPlay={!isReview}
          preload="auto"
          src={audioUrl}
          className="hidden"
        />
      ) : null}

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
      <div className="relative z-10 grid min-h-16 w-full grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2.5 lg:hidden">
        <div className="flex items-center justify-self-start">
          {isSubmitAction ? (
            <div
              className={cn(
                'flex items-center rounded-full transition-shadow',
                PRACTICE_HEADER_RING_CLASS,
                headerShellShadowClass
              )}
            >
              <button
                type="button"
                onClick={onPrimaryAction}
                disabled={isPrimaryActionDisabled}
                aria-label={primaryActionLabel}
                title={primaryActionLabel}
                className={cn(
                  'inline-flex h-10 shrink-0 items-center justify-center rounded-full border px-4 text-sm font-semibold shadow-[0_12px_28px_rgba(255,120,75,0.24)] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-none disabled:bg-stone-300 disabled:text-white/80 disabled:shadow-none dark:disabled:border-white/20 dark:disabled:bg-white/20 dark:disabled:text-white/50',
                  PRACTICE_HEADER_ACTIVE_BUTTON_CLASS
                )}
              >
                <span>{primaryActionLabel}</span>
              </button>
            </div>
          ) : onLogoClick ? (
            <div
              className={cn(
                'group flex items-center rounded-full p-1 transition-shadow',
                PRACTICE_HEADER_RING_CLASS,
                headerShellShadowClass
              )}
            >
              <button
                type="button"
                onClick={onLogoClick}
                aria-label="Exit"
                title="Exit"
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-full px-4 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-900 hover:text-white disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-transparent disabled:hover:text-stone-300 dark:text-white dark:hover:bg-white dark:hover:text-stone-950 dark:disabled:text-white/30 dark:disabled:hover:bg-transparent dark:disabled:hover:text-white/30"
              >
                <span>Exit</span>
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex h-full min-w-0 items-center justify-center">
          {isReview && audioControls.canControlPlayback ? (
            <ListeningHeaderReviewAudioPlayer audioControls={audioControls} compact />
          ) : (
            <TimerDisplay isReview={isReview} totalSeconds={timeLeftSeconds} />
          )}
        </div>

        <div className="flex items-center justify-self-end">
          <ListeningHeaderUtilityMenu
            audioControls={audioControls}
            mobile
            showFullscreenControl
            showNotesControl
            textSize={textSize}
            onTextSizeChange={onTextSizeChange}
          />
        </div>
      </div>

      <div className="relative z-10 hidden min-h-[72px] w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 py-2.5 lg:grid lg:px-6">
        <div className="relative -translate-y-1 flex h-full items-center justify-self-start gap-2">
          {isExitAction ? (
            <div
              className={cn(
                'group flex items-center rounded-full p-1 transition-shadow',
                PRACTICE_HEADER_RING_CLASS,
                headerShellShadowClass
              )}
            >
              <button
                type="button"
                onClick={onLogoClick}
                aria-label="Exit"
                title="Exit"
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-full px-4 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-900 hover:text-white disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-transparent disabled:hover:text-stone-300 dark:text-white dark:hover:bg-white dark:hover:text-stone-950 dark:disabled:text-white/30 dark:disabled:hover:bg-transparent dark:disabled:hover:text-white/30"
              >
                <span>Exit</span>
              </button>
            </div>
          ) : (
            <div
              className={cn(
                'group flex items-center rounded-full p-1 transition-shadow',
                PRACTICE_HEADER_RING_CLASS,
                headerShellShadowClass
              )}
            >
              <button
                type="button"
                onClick={onPrevPart}
                disabled={isPrevDisabled}
                title={prevActionLabel}
                aria-label={prevActionLabel}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-stone-800 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-transparent dark:text-white dark:hover:bg-white/8 dark:disabled:text-white/30 dark:disabled:hover:bg-transparent"
              >
                <ChevronLeft className="size-5" strokeWidth={1.9} />
              </button>

              {!isSubmitAction ? (
                <>
                  <span className="mx-0.5 h-7 w-px bg-stone-200 transition-opacity group-hover:opacity-0 dark:bg-white/12" />

                  <button
                    type="button"
                    onClick={onPrimaryAction}
                    disabled={isPrimaryActionDisabled}
                    aria-label={primaryActionLabel}
                    title={primaryActionLabel}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-transparent dark:text-white/38 dark:hover:bg-white/8 dark:hover:text-white/78 dark:disabled:text-white/30 dark:disabled:hover:bg-transparent"
                  >
                    {isReview ? (
                      <RotateCcw className="size-4.5" strokeWidth={1.9} />
                    ) : (
                      <ChevronRight className="size-5" strokeWidth={1.9} />
                    )}
                  </button>
                </>
              ) : null}
            </div>
          )}

          {isExitAction && !isSubmitAction ? (
            <div
              className={cn(
                'flex items-center rounded-full p-1 transition-shadow',
                PRACTICE_HEADER_RING_CLASS,
                headerShellShadowClass
              )}
            >
              <button
                type="button"
                onClick={onPrimaryAction}
                disabled={isPrimaryActionDisabled}
                aria-label={primaryActionLabel}
                title={primaryActionLabel}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-transparent dark:text-white/38 dark:hover:bg-white/8 dark:hover:text-white/78 dark:disabled:text-white/30 dark:disabled:hover:bg-transparent"
              >
                {isReview ? (
                  <RotateCcw className="size-4.5" strokeWidth={1.9} />
                ) : (
                  <ChevronRight className="size-5" strokeWidth={1.9} />
                )}
              </button>
            </div>
          ) : null}

          {isSubmitAction ? (
            <div
              className={cn(
                'flex items-center rounded-full transition-shadow',
                PRACTICE_HEADER_RING_CLASS,
                headerShellShadowClass
              )}
            >
              <button
                type="button"
                onClick={onPrimaryAction}
                disabled={isPrimaryActionDisabled}
                aria-label={primaryActionLabel}
                title={primaryActionLabel}
                className={cn(
                  'inline-flex h-11 shrink-0 items-center justify-center rounded-full border px-4 text-sm font-semibold shadow-[0_12px_28px_rgba(255,120,75,0.24)] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-none disabled:bg-stone-300 disabled:text-white/80 disabled:shadow-none dark:disabled:border-white/20 dark:disabled:bg-white/20 dark:disabled:text-white/50',
                  PRACTICE_HEADER_ACTIVE_BUTTON_CLASS
                )}
              >
                <span>{primaryActionLabel}</span>
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex h-full min-w-0 items-center self-center justify-center">
          {isReview && audioControls.canControlPlayback ? (
            <ListeningHeaderReviewAudioPlayer audioControls={audioControls} />
          ) : (
            <TimerDisplay isReview={isReview} totalSeconds={timeLeftSeconds} />
          )}
        </div>

        <div className="relative -translate-y-1 flex h-full items-center justify-self-end gap-2">
          <div
            className={cn(
              'flex items-center rounded-full p-1 transition-shadow',
              PRACTICE_HEADER_RING_CLASS,
              headerShellShadowClass
            )}
          >
            <div {...createHeaderControlHandlers('audio')}>
              <ListeningHeaderDesktopAudioMenu
                audioControls={audioControls}
                onExpandedChange={setIsAudioMenuExpanded}
              />
            </div>

            <span
              className={cn(
                'mx-0.5 h-7 w-px bg-stone-200 transition-opacity dark:bg-white/12',
                isAudioDividerHidden && 'opacity-0'
              )}
            />

            <div {...createHeaderControlHandlers('fullscreen')}>
              <ListeningHeaderFullscreenButton />
            </div>

            <span
              className={cn(
                'mx-0.5 h-7 w-px bg-stone-200 transition-opacity dark:bg-white/12',
                isFullscreenDividerHidden && 'opacity-0'
              )}
            />

            <div {...createHeaderControlHandlers('notes')}>
              <PracticeHeaderNotesButton eventName={LISTENING_OPEN_NOTES_EVENT} />
            </div>

            <span
              className={cn(
                'mx-0.5 h-7 w-px bg-stone-200 transition-opacity dark:bg-white/12',
                isNotesDividerHidden && 'opacity-0'
              )}
            />

            <div {...createHeaderControlHandlers('theme')}>
              <ListeningHeaderMoreMenu />
            </div>
          </div>

          <div
            className={cn(
              'flex items-center rounded-full p-1 transition-shadow',
              PRACTICE_HEADER_RING_CLASS,
              headerShellShadowClass
            )}
          >
            <ListeningHeaderUtilityMenu
              audioControls={audioControls}
              textSize={textSize}
              onTextSizeChange={onTextSizeChange}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

type ListeningHeaderDesktopAudioMenuProps = {
  audioControls: ReturnType<typeof useListeningHeaderAudio>;
  onExpandedChange?: (isExpanded: boolean) => void;
};

function getAudioProgressMax(duration: number) {
  return duration > 0 ? duration : 1;
}

function formatAudioTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

type ListeningHeaderReviewAudioPlayerProps = {
  audioControls: ReturnType<typeof useListeningHeaderAudio>;
  compact?: boolean;
};

function ListeningHeaderReviewAudioPlayer({
  audioControls,
  compact = false,
}: ListeningHeaderReviewAudioPlayerProps) {
  const progressMax = getAudioProgressMax(audioControls.duration);
  const progressValue = Math.min(audioControls.currentTime, progressMax);
  const PlaybackIcon = audioControls.isPlaying ? Pause : Play;

  const handleSeekBy = (seconds: number) => {
    audioControls.handleSeek(audioControls.currentTime + seconds);
  };

  return (
    <div
      className={cn(
        'inline-flex [filter:drop-shadow(0_8px_18px_rgba(15,23,42,0.08))_drop-shadow(0_2px_8px_rgba(15,23,42,0.04))] dark:[filter:none]',
        compact ? 'max-w-[62vw]' : 'max-w-[32rem]'
      )}
    >
      <div
        className={cn(
          'inline-flex min-w-0 items-center rounded-full px-2 py-1.5 text-stone-900 dark:text-white',
          PRACTICE_HEADER_RING_CLASS,
          compact ? 'gap-1' : 'gap-2'
        )}
      >
        <button
          type="button"
          onClick={() => handleSeekBy(-10)}
          aria-label="Rewind audio 10 seconds"
          title="Rewind 10 seconds"
          className={cn(
            'inline-flex shrink-0 items-center justify-center rounded-full text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-950 dark:text-white/68 dark:hover:bg-white/8 dark:hover:text-white',
            compact ? 'size-8' : 'size-9'
          )}
        >
          <Rewind className={compact ? 'size-3.5' : 'size-4'} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          onClick={audioControls.handleTogglePlay}
          aria-label={audioControls.isPlaying ? 'Pause audio' : 'Play audio'}
          title={audioControls.isPlaying ? 'Pause audio' : 'Play audio'}
          className={cn(
            'inline-flex shrink-0 items-center justify-center rounded-full bg-stone-950 text-white shadow-[0_8px_18px_rgba(15,23,42,0.18)] transition-colors hover:bg-stone-800 dark:bg-white dark:text-stone-950 dark:hover:bg-white/86',
            compact ? 'size-8' : 'size-10'
          )}
        >
          <PlaybackIcon className={compact ? 'size-3.5' : 'size-4.5'} strokeWidth={2.4} />
        </button>

        <div
          className={cn(
            'flex min-w-0 items-center gap-2',
            compact ? 'w-[34vw] max-w-[10rem]' : 'w-[20rem]'
          )}
        >
          <div className="relative min-w-0 flex-1">
            <Slider
              value={[progressValue]}
              max={progressMax}
              step={0.25}
              onValueChange={(nextValue) => audioControls.handleSeek(nextValue[0] ?? 0)}
              aria-label="Audio progress"
              className="min-w-0 flex-1 [&_[data-slot=slider-range]]:bg-[#ff9f2f] [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:border-white [&_[data-slot=slider-thumb]]:bg-[#ff9f2f] [&_[data-slot=slider-thumb]]:shadow-[0_4px_10px_rgba(255,159,47,0.3)] [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-track]]:bg-stone-300 dark:[&_[data-slot=slider-range]]:bg-[#ffb347] dark:[&_[data-slot=slider-track]]:bg-white/18"
            />
          </div>
          {!compact ? (
            <span className="shrink-0 text-[11px] font-semibold tabular-nums text-stone-500 dark:text-white/58">
              {formatAudioTime(audioControls.currentTime)} /{' '}
              {formatAudioTime(audioControls.duration)}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => handleSeekBy(10)}
          aria-label="Forward audio 10 seconds"
          title="Forward 10 seconds"
          className={cn(
            'inline-flex shrink-0 items-center justify-center rounded-full text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-950 dark:text-white/68 dark:hover:bg-white/8 dark:hover:text-white',
            compact ? 'size-8' : 'size-9'
          )}
        >
          <FastForward className={compact ? 'size-3.5' : 'size-4'} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

function ListeningHeaderDesktopAudioMenu({
  audioControls,
  onExpandedChange,
}: ListeningHeaderDesktopAudioMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const canControlPlayback = audioControls.canControlPlayback;
  const TriggerIcon =
    audioControls.volume === 0 ? VolumeX : audioControls.volume < 50 ? Volume1 : Volume2;
  const PlaybackIcon = audioControls.isPlaying ? Pause : Play;

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
    if (!isExpanded || canControlPlayback) {
      return undefined;
    }

    const closeTimer = window.setTimeout(() => {
      updateExpandedState(false);
    }, 4000);

    return () => window.clearTimeout(closeTimer);
  }, [audioControls.volume, canControlPlayback, isExpanded, updateExpandedState]);

  return (
    <div
      ref={shellRef}
      className={cn(
        'relative flex h-9 shrink-0 items-center overflow-hidden rounded-full transition-[width] duration-300 ease-out',
        isExpanded ? (canControlPlayback ? 'w-[286px]' : 'w-[138px]') : 'w-10'
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
          'flex h-full w-full items-center gap-1 rounded-full bg-stone-100/95 pl-2 pr-1.5 text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all duration-200 dark:bg-white/8 dark:text-white dark:shadow-none',
          isExpanded
            ? 'visible translate-x-0 opacity-100'
            : 'invisible pointer-events-none translate-x-4 opacity-0'
        )}
      >
        {canControlPlayback ? (
          <>
            <button
              type="button"
              onClick={audioControls.handleTogglePlay}
              aria-label={audioControls.isPlaying ? 'Pause audio' : 'Play audio'}
              title={audioControls.isPlaying ? 'Pause audio' : 'Play audio'}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-stone-800 transition-colors hover:bg-white hover:text-stone-950 dark:text-white/86 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <PlaybackIcon className="size-4" strokeWidth={2.2} />
            </button>

            <Slider
              value={[
                Math.min(audioControls.currentTime, getAudioProgressMax(audioControls.duration)),
              ]}
              max={getAudioProgressMax(audioControls.duration)}
              step={0.25}
              onValueChange={(nextValue) => audioControls.handleSeek(nextValue[0] ?? 0)}
              aria-label="Audio progress"
              className="w-[116px] shrink-0 [&_[data-slot=slider-range]]:bg-[#ff9f2f] [&_[data-slot=slider-thumb]]:size-3.5 [&_[data-slot=slider-thumb]]:border-white [&_[data-slot=slider-thumb]]:bg-[#ff9f2f] [&_[data-slot=slider-thumb]]:shadow-[0_4px_10px_rgba(255,159,47,0.3)] [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-track]]:bg-stone-300 dark:[&_[data-slot=slider-range]]:bg-[#ffb347] dark:[&_[data-slot=slider-track]]:bg-white/18"
            />
          </>
        ) : null}

        <Slider
          value={[audioControls.volume]}
          max={100}
          step={1}
          onValueChange={(nextValue) => audioControls.handleVolumeChange(nextValue[0] ?? 0)}
          aria-label="Audio volume"
          className={cn(
            'shrink-0 [&_[data-slot=slider-range]]:bg-stone-950 [&_[data-slot=slider-thumb]]:border-0 [&_[data-slot=slider-thumb]]:bg-transparent [&_[data-slot=slider-thumb]]:opacity-0 [&_[data-slot=slider-thumb]]:shadow-none [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-track]]:bg-stone-300 dark:[&_[data-slot=slider-range]]:bg-white dark:[&_[data-slot=slider-track]]:bg-white/18',
            canControlPlayback
              ? 'w-[58px] [&_[data-slot=slider-thumb]]:size-0'
              : 'w-[88px] [&_[data-slot=slider-thumb]]:size-0'
          )}
        />

        <button
          type="button"
          onClick={audioControls.handleToggleMute}
          aria-label={audioControls.volume === 0 ? 'Unmute audio' : 'Mute audio'}
          title={audioControls.volume === 0 ? 'Unmute audio' : 'Mute audio'}
          className="inline-flex size-6 shrink-0 items-center justify-center text-stone-700 transition-colors hover:text-stone-950 dark:text-white/78 dark:hover:text-white"
        >
          <TriggerIcon className="size-4.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

type ListeningHeaderMobileMenuProps = {
  audioControls: ReturnType<typeof useListeningHeaderAudio>;
};

function ListeningHeaderUtilityMenu({
  audioControls,
  mobile = false,
  showNotesControl = false,
  showFullscreenControl = false,
  onTextSizeChange,
  textSize,
}: ListeningHeaderMobileMenuProps & {
  mobile?: boolean;
  onTextSizeChange: (textSize: PracticeTextSize) => void;
  showNotesControl?: boolean;
  showFullscreenControl?: boolean;
  textSize: PracticeTextSize;
}) {
  const [open, setOpen] = useState(false);
  const helpItems = mobile ? [] : LISTENING_DESKTOP_HELP_ITEMS;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open listening controls"
          title="Open listening controls"
          className={cn(
            'inline-flex shrink-0 items-center justify-center rounded-full text-stone-800 transition-colors',
            mobile
              ? cn(
                  'size-10 shadow-lg hover:bg-stone-50 dark:text-white/78 dark:shadow-none dark:hover:bg-white/8 dark:hover:text-white',
                  PRACTICE_HEADER_RING_CLASS
                )
              : 'size-9 hover:bg-stone-100 dark:text-white/78 dark:hover:bg-white/8 dark:hover:text-white',
            mobile && 'dark:text-white/78 dark:hover:text-white'
          )}
        >
          <EllipsisVertical className="size-4.5" strokeWidth={2} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className={`max-h-[calc(100svh-5rem)] w-[16.5rem] max-w-[calc(100vw-1rem)] overflow-y-scroll overscroll-contain rounded-2xl p-2 touch-pan-y text-stone-900 [scrollbar-gutter:stable] [scrollbar-width:thin] dark:text-white dark:shadow-none ${PRACTICE_MENU_PANEL_RING_CLASS} sm:max-h-[32rem]`}
      >
        <div className="space-y-3">
          {showNotesControl || showFullscreenControl ? (
            <PracticeHeaderMenuQuickActions>
              {showFullscreenControl ? (
                <PracticeHeaderMenuQuickActionShell>
                  <ListeningHeaderFullscreenButton />
                </PracticeHeaderMenuQuickActionShell>
              ) : null}
              {showNotesControl ? (
                <PracticeHeaderMenuQuickActionShell>
                  <PracticeHeaderNotesButton eventName={LISTENING_OPEN_NOTES_EVENT} />
                </PracticeHeaderMenuQuickActionShell>
              ) : null}
              {showNotesControl ? (
                <PracticeHeaderMenuQuickActionShell>
                  <ListeningHeaderMoreMenu />
                </PracticeHeaderMenuQuickActionShell>
              ) : null}
              <PracticeHeaderMenuQuickActionShell>
                <PracticeHeaderShareButton />
              </PracticeHeaderMenuQuickActionShell>
            </PracticeHeaderMenuQuickActions>
          ) : null}

          {mobile ? (
            <div className="overflow-hidden rounded-[14px] bg-stone-50 dark:bg-white/4">
              <div className="px-2.5 pt-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-white/45">
                  Audio
                </div>
              </div>

              <ListeningHeaderAudio controls={audioControls} variant="mobile" />

              <div className="relative before:absolute before:left-2.5 before:right-2.5 before:top-0 before:h-px before:bg-stone-200/70 dark:before:bg-white/8">
                <div className="px-2.5 pt-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-white/45">
                    Text Size
                  </div>
                </div>

                <PracticeTextSizeSlider
                  menuOpen={open}
                  textSize={textSize}
                  onTextSizeChange={onTextSizeChange}
                  variant="bare"
                />
              </div>
            </div>
          ) : (
            <PracticeTextSizeSlider
              menuOpen={open}
              textSize={textSize}
              onTextSizeChange={onTextSizeChange}
            />
          )}

          {helpItems.length ? (
            <>
              <DropdownMenuLabel className="px-2.5 pb-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-white/45">
                Help
              </DropdownMenuLabel>

              <div className="overflow-hidden rounded-2xl bg-stone-50 dark:bg-white/4">
                {helpItems.map(({ description, icon: Icon, title }, index) => (
                  <div
                    key={title}
                    className={cn(
                      'px-2.5 py-2',
                      index > 0 &&
                        'relative before:absolute before:left-2.5 before:right-2.5 before:top-0 before:h-px before:bg-stone-200/70 dark:before:bg-white/8'
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-stone-600 shadow-sm dark:bg-white/8 dark:text-white/68 dark:shadow-none">
                        <Icon className="size-3.5" strokeWidth={2} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-stone-900 dark:text-white">
                          {title}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-5 text-stone-500 dark:text-white/45">
                          {description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
