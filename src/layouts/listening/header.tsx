/* eslint-disable react-hooks/refs */

'use client';

import type { PracticeTextSize } from '@/src/sections/practice/shared/practice-text-size';

import { cn } from '@/src/lib/utils';
import { paths } from '@/src/routes/paths';
import { Logo } from '@/src/components/logo';
import { Slider } from '@/src/components/ui/slider';
import { useRef, useState, useEffect, useCallback } from 'react';
import { PracticeTextSizeSlider } from '@/src/layouts/practice/practice-text-size-slider';
import { PRACTICE_HEADER_ACTIVE_BUTTON_CLASS } from '@/src/layouts/practice-footer-theme';
import {
  PracticeHeaderNotesButton,
  LISTENING_OPEN_NOTES_EVENT,
} from '@/src/layouts/practice';
import {
  PRACTICE_HEADER_RING_CLASS,
  PRACTICE_MENU_PANEL_RING_CLASS,
} from '@/src/layouts/practice-surface-theme';
import {
  Volume1,
  Volume2,
  VolumeX,
  RotateCcw,
  PencilLine,
  Headphones,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/src/components/ui/dropdown-menu';

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
  onTextSizeChange: (textSize: PracticeTextSize) => void;
  prevActionLabel?: string;
  primaryActionLabel: string;
  textSize: PracticeTextSize;
  timeLeftSeconds: number;
};

type ListeningHeaderControl = 'audio' | 'fullscreen' | 'notes' | 'theme' | null;

const LISTENING_HELP_ITEMS = [
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
  onTextSizeChange,
  prevActionLabel = 'Prev',
  primaryActionLabel,
  textSize,
  timeLeftSeconds,
}: ListeningTestHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredHeaderControl, setHoveredHeaderControl] = useState<ListeningHeaderControl>(null);
  const [isAudioMenuExpanded, setIsAudioMenuExpanded] = useState(false);
  const audioControls = useListeningHeaderAudio(audioUrl);
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

  const createHeaderControlHandlers = (
    control: Exclude<ListeningHeaderControl, null>
  ) => ({
    onBlurCapture: (event: React.FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        setHoveredHeaderControl((currentValue) =>
          currentValue === control ? null : currentValue
        );
      }
    },
    onFocusCapture: () => {
      setHoveredHeaderControl(control);
    },
    onMouseEnter: () => {
      setHoveredHeaderControl(control);
    },
    onMouseLeave: () => {
      setHoveredHeaderControl((currentValue) =>
        currentValue === control ? null : currentValue
      );
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

  return (
    <header className="sticky top-0 z-40 isolate border-stone-200 bg-linear-to-b from-white from-20% to-transparent to-80% dark:border-white/10 dark:bg-linear-to-b dark:from-background dark:from-20% dark:to-transparent dark:to-80%">
      {audioUrl ? (
        <audio
          ref={audioControls.audioRef}
          autoPlay
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
      <div className="relative z-10 flex min-h-16 w-full items-center justify-between gap-3 px-4 py-2.5 sm:hidden">
        <Logo
          href={paths.practice.listening.root}
          size={22}
          variant="dark"
          onClick={
            onLogoClick
              ? (event) => {
                  event.preventDefault();
                  onLogoClick();
                }
              : undefined
          }
        />

        <div className="flex h-full min-w-0 flex-1 items-center self-center">
          <div className="flex w-full items-center justify-center">
            <TimerDisplay isReview={isReview} totalSeconds={timeLeftSeconds} />
          </div>
        </div>

        <div className="flex h-full shrink-0 self-center items-center gap-2">
          <PracticeHeaderNotesButton mobile eventName={LISTENING_OPEN_NOTES_EVENT} />

          <div
            className={cn(
              'flex items-center rounded-full p-1 shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-none',
              PRACTICE_HEADER_RING_CLASS
            )}
          >
            <ListeningHeaderMoreMenu />
          </div>

          <ListeningHeaderUtilityMenu
            audioControls={audioControls}
            mobile
            showFullscreenControl
            textSize={textSize}
            onTextSizeChange={onTextSizeChange}
          />
        </div>
      </div>

      <div className="relative z-10 hidden min-h-[72px] w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 py-2.5 sm:grid sm:px-6">
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

        <div className="flex h-full items-center self-center justify-center">
          <TimerDisplay isReview={isReview} totalSeconds={timeLeftSeconds} />
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

function ListeningHeaderDesktopAudioMenu({
  audioControls,
  onExpandedChange,
}: ListeningHeaderDesktopAudioMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const TriggerIcon =
    audioControls.volume === 0 ? VolumeX : audioControls.volume < 50 ? Volume1 : Volume2;

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
  }, [audioControls.volume, isExpanded, updateExpandedState]);

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
          isExpanded ? 'invisible pointer-events-none translate-x-2 opacity-0' : 'visible opacity-100'
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
          value={[audioControls.volume]}
          max={100}
          step={1}
          onValueChange={(nextValue) => audioControls.handleVolumeChange(nextValue[0] ?? 0)}
          aria-label="Audio volume"
          className="w-[88px] shrink-0 [&_[data-slot=slider-range]]:bg-stone-950 [&_[data-slot=slider-thumb]]:size-0 [&_[data-slot=slider-thumb]]:border-0 [&_[data-slot=slider-thumb]]:bg-transparent [&_[data-slot=slider-thumb]]:opacity-0 [&_[data-slot=slider-thumb]]:shadow-none [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-track]]:bg-stone-300 dark:[&_[data-slot=slider-range]]:bg-white dark:[&_[data-slot=slider-track]]:bg-white/18"
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
  showFullscreenControl = false,
  onTextSizeChange,
  textSize,
}: ListeningHeaderMobileMenuProps & {
  mobile?: boolean;
  onTextSizeChange: (textSize: PracticeTextSize) => void;
  showFullscreenControl?: boolean;
  textSize: PracticeTextSize;
}) {
  const [open, setOpen] = useState(false);

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
        className={`w-[16.5rem] max-w-[calc(100vw-1rem)] rounded-2xl p-1 text-stone-900 shadow-[0_20px_40px_rgba(15,23,42,0.18)] dark:text-white dark:shadow-none ${PRACTICE_MENU_PANEL_RING_CLASS}`}
      >
        {mobile ? (
          <>
            <ListeningHeaderAudio controls={audioControls} variant="mobile" />
            <DropdownMenuSeparator className="mx-1 my-2" />
          </>
        ) : null}

        {showFullscreenControl ? (
          <>
            <div className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-stone-900 dark:text-white">
              <span>Full screen</span>
              <ListeningHeaderFullscreenButton />
            </div>
            <DropdownMenuSeparator className="mx-1 my-2" />
          </>
        ) : null}

        <DropdownMenuLabel className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-white/45">
          Text Size
        </DropdownMenuLabel>

        <PracticeTextSizeSlider
          menuOpen={open}
          textSize={textSize}
          onTextSizeChange={onTextSizeChange}
        />

        <DropdownMenuSeparator className="mx-1 my-1.5" />

        <DropdownMenuLabel className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-white/45">
          Help
        </DropdownMenuLabel>

        <div className="space-y-1 px-1 pb-1">
          {LISTENING_HELP_ITEMS.map(({ description, icon: Icon, title }) => (
            <div
              key={title}
              className="rounded-xl bg-stone-50 px-2.5 py-2 dark:bg-white/4"
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
