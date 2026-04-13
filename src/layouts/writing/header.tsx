'use client';

import type { WritingTextSize } from '@/src/sections/practice/writing/types';

import { cn } from '@/src/lib/utils';
import { paths } from '@/src/routes/paths';
import { useState, useEffect } from 'react';
import { Logo } from '@/src/components/logo';
import { Slider as SliderPrimitive } from 'radix-ui';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip';
import {
  Copy,
  RotateCcw,
  PencilLine,
  ChevronLeft,
  Highlighter,
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
import {
  WRITING_TEXT_SIZE_MAX,
  WRITING_TEXT_SIZE_MIN,
  WRITING_OPEN_NOTES_EVENT,
  WRITING_TEXT_SIZE_DEFAULT,
} from '@/src/sections/practice/writing/types';

import GradualBlur from '../../components/GradualBlur';
import { TimerDisplay } from '../listening/timer-display';
import { ListeningHeaderFullscreenButton } from '../listening/header-more-menu';

const HELP_ITEMS = [
  {
    description:
      "Matnni belgilang va chiqadigan floating markerlar orqali kerakli rangni tanlang.",
    icon: Highlighter,
    iconClassName: 'text-amber-500',
    title: 'Highlighting',
  },
  {
    description:
      "Matnni belgilang, keyin Notes tugmasi yoki T orqali o‘ng tomondagi notes panelni oching.",
    icon: PencilLine,
    iconClassName: 'text-blue-500',
    title: 'Notes',
  },
  {
    description: "Writing bo'limida matnni tez tahrirlash uchun Ctrl+C va Ctrl+V ishlating.",
    icon: Copy,
    iconClassName: 'text-emerald-600',
    title: 'Copy / Paste',
  },
] as const;

type WritingHeaderMoreMenuProps = {
  mobile?: boolean;
  onTextSizeChange: (textSize: WritingTextSize) => void;
  showFullscreenControl?: boolean;
  textSize: WritingTextSize;
};

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

function getTextSizeIndex(textSize: WritingTextSize) {
  return Math.min(WRITING_TEXT_SIZE_MAX, Math.max(WRITING_TEXT_SIZE_MIN, Math.round(textSize)));
}

function getTextSizeValue(index: number): WritingTextSize {
  return Math.min(WRITING_TEXT_SIZE_MAX, Math.max(WRITING_TEXT_SIZE_MIN, Math.round(index)));
}

function requestOpenNotes() {
  window.dispatchEvent(new CustomEvent(WRITING_OPEN_NOTES_EVENT));
}

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
  const isSubmitAction = primaryActionLabel.toLowerCase().includes('submit');

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

      <div className="relative z-10 mx-auto flex w-full max-w-345 items-center justify-between gap-3 px-4 py-2.5 sm:hidden">
        <Logo
          href={paths.practice.writing.root}
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
        <div className="min-w-0 flex-1">
          <div className="flex justify-center">
            <TimerDisplay isReview={isReview} totalSeconds={timeLeftSeconds} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WritingHeaderNotesButton mobile />
          <WritingHeaderMoreMenu
            mobile
            showFullscreenControl
            textSize={textSize}
            onTextSizeChange={onTextSizeChange}
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto hidden w-full max-w-345 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 py-2.5 sm:grid sm:px-6">
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
            className={cn(
              'inline-flex h-9 shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-transparent',
              isSubmitAction
                ? 'px-3 text-sm font-semibold text-stone-700 hover:bg-stone-100'
                : 'w-10 text-stone-400 hover:bg-stone-100 hover:text-stone-700'
            )}
          >
            {isReview ? (
              <RotateCcw className="size-4.5" strokeWidth={1.9} />
            ) : isSubmitAction ? (
              <span>{primaryActionLabel}</span>
            ) : (
              <ChevronRight className="size-5" strokeWidth={1.9} />
            )}
          </button>
        </div>

        <div className="flex justify-center">
          <TimerDisplay isReview={isReview} totalSeconds={timeLeftSeconds} />
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
            <ListeningHeaderFullscreenButton />
            <span className="mx-0.5 h-7 w-px bg-stone-200 transition-opacity group-hover:opacity-0" />
            <WritingHeaderNotesButton />
          </div>

          <div
            className={cn(
              'flex items-center rounded-full border border-border/20 bg-white p-1 transition-shadow',
              isScrolled
                ? 'shadow-[0_14px_30px_rgba(15,23,42,0.16),0_4px_14px_rgba(15,23,42,0.1)]'
                : 'shadow-lg'
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
          ? 'size-10 border border-border/30 bg-white shadow-lg hover:bg-stone-50'
          : 'size-9 hover:bg-stone-100'
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
  textSize,
}: WritingHeaderMoreMenuProps) {
  const [open, setOpen] = useState(false);

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
              ? 'size-10 border border-border/30 bg-white shadow-lg hover:bg-stone-50'
              : 'size-9 hover:bg-stone-100'
          )}
        >
          <EllipsisVertical className="size-4.5" strokeWidth={2} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[22rem] max-w-[calc(100vw-1rem)] rounded-2xl border border-stone-200 bg-white p-2 text-stone-900 shadow-[0_20px_40px_rgba(15,23,42,0.18)]"
      >
        {showFullscreenControl ? (
          <>
            <div className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-stone-900">
              <span>Full screen</span>
              <ListeningHeaderFullscreenButton />
            </div>
            <DropdownMenuSeparator className="mx-1 my-2" />
          </>
        ) : null}

        <DropdownMenuLabel className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
          Quick Help
        </DropdownMenuLabel>

        <div className="space-y-2 px-1 pb-1">
          {HELP_ITEMS.map(({ description, icon: Icon, iconClassName, title }) => (
            <div key={title} className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3">
              <div className="flex items-start gap-3">
                <Icon className={cn('mt-0.5 size-4', iconClassName)} strokeWidth={2} />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-stone-900">{title}</p>
                  <p className="text-xs leading-5 text-stone-600">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <DropdownMenuSeparator className="mx-1 my-2" />

        <DropdownMenuLabel className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
          Text Size
        </DropdownMenuLabel>

        <WritingTextSizeSlider
          menuOpen={open}
          textSize={textSize}
          onTextSizeChange={onTextSizeChange}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function WritingTextSizeSlider({
  menuOpen,
  onTextSizeChange,
  textSize,
}: Pick<WritingHeaderMoreMenuProps, 'onTextSizeChange' | 'textSize'> & {
  menuOpen: boolean;
}) {
  const activeSize = getTextSizeIndex(textSize);
  const totalSteps = WRITING_TEXT_SIZE_MAX - WRITING_TEXT_SIZE_MIN;
  const activePercent =
    totalSteps > 0 ? ((activeSize - WRITING_TEXT_SIZE_MIN) / totalSteps) * 100 : 0;
  const [isTooltipReady, setIsTooltipReady] = useState(false);

  useEffect(() => {
    if (!menuOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsTooltipReady(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setIsTooltipReady(true);
    }, 140);

    // eslint-disable-next-line consistent-return
    return () => {
      window.clearTimeout(timer);
    };
  }, [menuOpen]);

  return (
    <div className="px-1 pb-1">
      <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-4">
        <button
          type="button"
          aria-label="Reset text size"
          title="Reset text size"
          onClick={() => {
            if (activeSize !== WRITING_TEXT_SIZE_DEFAULT) {
              onTextSizeChange(WRITING_TEXT_SIZE_DEFAULT);
            }
          }}
          className={cn(
            'inline-flex items-center gap-2 rounded-full -ml-1 px-1 text-left transition-colors',
            activeSize !== WRITING_TEXT_SIZE_DEFAULT
              ? 'cursor-pointer hover:text-slate-800'
              : 'cursor-default'
          )}
        >
          <span className="text-[13px] font-semibold text-slate-600">Size</span>
          <span
            className={cn(
              'inline-flex size-6 items-center justify-center rounded-full transition-colors',
              activeSize !== WRITING_TEXT_SIZE_DEFAULT
                ? 'text-slate-500 hover:bg-stone-200 hover:text-slate-700'
                : 'text-transparent'
            )}
          >
            <RotateCcw className="size-3.5" strokeWidth={2} />
          </span>
        </button>

        <div className="pt-8">
          <div className="relative">
            <SliderPrimitive.Root
              value={[activeSize]}
              min={WRITING_TEXT_SIZE_MIN}
              max={WRITING_TEXT_SIZE_MAX}
              step={1}
              aria-label="Text size"
              onValueChange={(nextValue) =>
                onTextSizeChange(getTextSizeValue(nextValue[0] ?? WRITING_TEXT_SIZE_DEFAULT))
              }
              className="relative flex w-full touch-none items-center select-none"
            >
              <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
                {Array.from({ length: totalSteps + 1 }).map((_, index) => {
                  const tickPercent = totalSteps > 0 ? (index / totalSteps) * 100 : 0;
                  const isActiveTick = tickPercent <= activePercent;
                  const isEdgeTick = index === 0 || index === totalSteps;

                  if (isEdgeTick) {
                    return null;
                  }

                  return (
                    <span
                      key={tickPercent}
                      className={cn(
                        'absolute top-1/2 block h-3 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full',
                        isActiveTick ? 'bg-white/75' : 'bg-stone-300'
                      )}
                      style={{ left: `${tickPercent}%` }}
                    />
                  );
                })}
              </div>

              <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-[#eaedf1]">
                <SliderPrimitive.Range className="absolute h-full bg-linear-to-r from-[#58d790] to-[#149174]" />
              </SliderPrimitive.Track>

              <Tooltip open={isTooltipReady}>
                <TooltipTrigger asChild>
                  <SliderPrimitive.Thumb className="relative z-10 block size-6 shrink-0 rounded-full border-4 border-white bg-[#eff3f7] shadow-[0_8px_18px_rgba(148,163,184,0.38)] outline-none" />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="center"
                  sideOffset={18}
                  avoidCollisions={false}
                  className="relative rounded-[14px] bg-[#1f2632] px-3 py-1.5 text-[13px] font-semibold text-white shadow-[0_12px_26px_rgba(15,23,42,0.22)] after:absolute after:left-1/2 after:top-full after:block after:size-2.5 after:-translate-x-1/2 after:-translate-y-1 after:rotate-45 after:rounded-[2px] after:bg-[#1f2632] after:content-['']"
                >
                  {activeSize}px
                </TooltipContent>
              </Tooltip>
            </SliderPrimitive.Root>
          </div>
        </div>
      </div>
    </div>
  );
}
