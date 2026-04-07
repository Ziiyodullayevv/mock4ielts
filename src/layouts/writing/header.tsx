'use client';

import { cn } from '@/src/lib/utils';
import { paths } from '@/src/routes/paths';
import { useState, useEffect } from 'react';
import { Logo } from '@/src/components/logo';
import { RotateCcw, ChevronLeft, ChevronRight, EllipsisVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';

import GradualBlur from '../../components/GradualBlur';
import { TimerDisplay } from '../listening/timer-display';
import { ListeningHeaderMoreMenu, ListeningHeaderFullscreenButton } from '../listening/header-more-menu';

type WritingTestHeaderProps = {
  isPrimaryActionDisabled?: boolean;
  isPrevDisabled: boolean;
  isReview: boolean;
  onLogoClick?: () => void;
  onPrevPart: () => void;
  onPrimaryAction: () => void;
  prevActionLabel?: string;
  primaryActionLabel: string;
  timeLeftSeconds: number;
};

export function WritingTestHeader({
  isPrimaryActionDisabled = false,
  isPrevDisabled,
  isReview,
  onLogoClick,
  onPrevPart,
  onPrimaryAction,
  prevActionLabel = 'Prev',
  primaryActionLabel,
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

      {/* Mobile */}
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
        <WritingHeaderMobileMenu />
      </div>

      {/* Desktop */}
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
              'flex items-center rounded-full border border-border/20 bg-white p-1 transition-shadow',
              isScrolled
                ? 'shadow-[0_14px_30px_rgba(15,23,42,0.16),0_4px_14px_rgba(15,23,42,0.1)]'
                : 'shadow-lg'
            )}
          >
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

function WritingHeaderMobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open writing controls"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border/30 bg-white text-stone-800 shadow-lg transition-colors hover:bg-stone-50"
        >
          <EllipsisVertical className="size-4.5" strokeWidth={2} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        forceMount
        align="end"
        sideOffset={10}
        className="w-56 rounded-2xl border border-stone-200 bg-white p-2 text-stone-900 shadow-[0_20px_40px_rgba(15,23,42,0.18)]"
      >
        <div className="space-y-1">
          <div className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-stone-900">
            <span>Full screen</span>
            <ListeningHeaderFullscreenButton />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
