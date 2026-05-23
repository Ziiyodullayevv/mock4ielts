'use client';

import type { WritingTextSize } from '@/src/sections/practice/writing/types';

import { cn } from '@/src/lib/utils';
import { useState, useEffect } from 'react';
import {
  WRITING_OPEN_NOTES_EVENT,
} from '@/src/sections/practice/writing/types';
import { PracticeTextSizeSlider } from '@/src/layouts/practice/practice-text-size-slider';
import { PRACTICE_HEADER_ACTIVE_BUTTON_CLASS } from '@/src/layouts/practice-footer-theme';
import { PracticeHeaderShareButton } from '@/src/layouts/practice/practice-header-share-button';
import {
  PRACTICE_HEADER_RING_CLASS,
  PRACTICE_MENU_PANEL_RING_CLASS,
} from '@/src/layouts/practice-surface-theme';
import {
  RotateCcw,
  PencilLine,
  Highlighter,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
} from 'lucide-react';
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

import GradualBlur from '../../components/GradualBlur';
import { TimerDisplay } from '../listening/timer-display';
import { ListeningHeaderMoreMenu, ListeningHeaderFullscreenButton } from '../listening/header-more-menu';

type WritingHeaderMoreMenuProps = {
  mobile?: boolean;
  onTextSizeChange: (textSize: WritingTextSize) => void;
  showFullscreenControl?: boolean;
  showNotesControl?: boolean;
  textSize: WritingTextSize;
};

type WritingHeaderControl = 'fullscreen' | 'notes' | 'theme' | null;

type WritingTestHeaderProps = {
  isPrimaryActionDisabled?: boolean;
  isPrevDisabled: boolean;
  isReview: boolean;
  onLogoClick?: () => void;
  onPrevPart: () => void;
  onPrimaryAction: () => void;
  onTextSizeChange: (textSize: WritingTextSize) => void;
  prevActionLabel?: string;
  primaryActionLabel: string;
  textSize: WritingTextSize;
  timeLeftSeconds: number;
};

function requestOpenNotes() {
  window.dispatchEvent(new CustomEvent(WRITING_OPEN_NOTES_EVENT));
}

const WRITING_DESKTOP_HELP_ITEMS = [
  {
    description: 'Select text and choose a color from the floating toolbar.',
    icon: Highlighter,
    title: 'Highlight',
  },
  {
    description: 'Select text, then save a note to keep it in the Notes panel.',
    icon: PencilLine,
    title: 'Notes',
  },
] as const;

const WRITING_MOBILE_HELP_ITEMS = [
  {
    description: 'Select text and choose a color from the floating toolbar.',
    icon: Highlighter,
    title: 'Highlight',
  },
] as const;

export function WritingTestHeader({
  isPrimaryActionDisabled = false,
  isPrevDisabled,
  isReview,
  onLogoClick,
  onPrevPart,
  onPrimaryAction,
  onTextSizeChange,
  prevActionLabel = 'Prev',
  primaryActionLabel,
  textSize,
  timeLeftSeconds,
}: WritingTestHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredHeaderControl, setHoveredHeaderControl] = useState<WritingHeaderControl>(null);
  const isExitAction = isPrevDisabled && Boolean(onLogoClick);
  const isSubmitAction = primaryActionLabel.toLowerCase().includes('submit');
  const headerShellShadowClass = isScrolled
    ? 'shadow-[0_12px_26px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] dark:shadow-none'
    : 'shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-none';
  const isFirstDividerHidden =
    hoveredHeaderControl === 'fullscreen' || hoveredHeaderControl === 'notes';
  const isSecondDividerHidden = hoveredHeaderControl === 'notes' || hoveredHeaderControl === 'theme';

  const createHeaderControlHandlers = (control: Exclude<WritingHeaderControl, null>) => ({
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

      <div className="relative z-10 grid min-h-16 w-full grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2.5 sm:hidden">
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
                  'inline-flex h-10 shrink-0 items-center justify-center rounded-full border px-4 text-sm font-semibold shadow-[0_12px_28px_rgba(255,120,75,0.24)] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-none disabled:bg-stone-300 disabled:text-white/80 disabled:shadow-none',
                  'dark:disabled:border-white/20 dark:disabled:bg-white/20 dark:disabled:text-white/50',
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
        <div className="flex h-full items-center justify-center">
          <TimerDisplay isReview={isReview} totalSeconds={timeLeftSeconds} />
        </div>
        <div className="flex items-center justify-self-end">
          <WritingHeaderMoreMenu
            mobile
            showFullscreenControl
            showNotesControl
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
                  'inline-flex h-11 shrink-0 items-center justify-center rounded-full border px-4 text-sm font-semibold shadow-[0_12px_28px_rgba(255,120,75,0.24)] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-none disabled:bg-stone-300 disabled:text-white/80 disabled:shadow-none',
                  'dark:disabled:border-white/20 dark:disabled:bg-white/20 dark:disabled:text-white/50',
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
            <div {...createHeaderControlHandlers('fullscreen')}>
              <ListeningHeaderFullscreenButton />
            </div>

            <span
              className={cn(
                'mx-0.5 h-7 w-px bg-stone-200 transition-opacity dark:bg-white/12',
                isFirstDividerHidden && 'opacity-0'
              )}
            />

            <div {...createHeaderControlHandlers('notes')}>
              <WritingHeaderNotesButton />
            </div>

            <span
              className={cn(
                'mx-0.5 h-7 w-px bg-stone-200 transition-opacity dark:bg-white/12',
                isSecondDividerHidden && 'opacity-0'
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
            <WritingHeaderMoreMenu textSize={textSize} onTextSizeChange={onTextSizeChange} />
          </div>
        </div>
      </div>
    </header>
  );
}

function WritingHeaderNotesButton({ mobile = false }: { mobile?: boolean }) {
  return (
    <button
      type="button"
      data-writing-notes-trigger
      aria-label="Open notes"
      title="Open notes"
      onClick={requestOpenNotes}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full text-stone-800 transition-colors',
        mobile
          ? cn(
              'size-10 shadow-lg hover:bg-stone-50 dark:text-white/78 dark:shadow-none dark:hover:bg-white/8 dark:hover:text-white',
              PRACTICE_HEADER_RING_CLASS
            )
          : 'h-9 w-10 hover:bg-stone-100 dark:text-white/78 dark:hover:bg-white/8 dark:hover:text-white',
        mobile && 'dark:text-white/78 dark:hover:text-white'
      )}
    >
      <PencilLine className="size-4.5" strokeWidth={2} />
    </button>
  );
}

function WritingHeaderMoreMenu({
  mobile = false,
  onTextSizeChange,
  showFullscreenControl = false,
  showNotesControl = false,
  textSize,
}: WritingHeaderMoreMenuProps) {
  const [open, setOpen] = useState(false);
  const helpItems = mobile ? WRITING_MOBILE_HELP_ITEMS : WRITING_DESKTOP_HELP_ITEMS;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open writing controls"
          title="Open writing controls"
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
                  <WritingHeaderNotesButton />
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

          <DropdownMenuLabel className="px-2.5 pb-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-white/45">
            Text Size
          </DropdownMenuLabel>

          <PracticeTextSizeSlider
            menuOpen={open}
            textSize={textSize}
            onTextSizeChange={onTextSizeChange}
          />

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
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
