'use client';

import type { Answers, ReadingTest } from '@/src/sections/practice/reading/types';
import type { ReadingPartNumber } from './types';

import { cn } from '@/src/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  countPartAnswered,
  getPartQuestionIds,
} from '@/src/sections/practice/reading/utils';
import {
  PRACTICE_FOOTER_SHELL_CLASS,
  PRACTICE_FOOTER_TOP_BAR_CLASS,
  PRACTICE_FOOTER_ACTIVE_SURFACE_CLASS,
  PRACTICE_FOOTER_DARK_BUTTON_RING_CLASS,
} from '@/src/layouts/practice-footer-theme';

type ReadingTestFooterProps = {
  activePart: ReadingPartNumber;
  activeQuestionId: string | null;
  answers: Answers;
  isPrimaryActionDisabled?: boolean;
  isPrevDisabled?: boolean;
  onPrimaryAction: () => void;
  onPartChange: (part: ReadingPartNumber) => void;
  onPrevPart: () => void;
  onQuestionSelect: (part: ReadingPartNumber, questionId: string) => void;
  prevActionLabel?: string;
  primaryActionLabel?: string;
  test: ReadingTest;
};

export function ReadingTestFooter({
  activePart,
  answers,
  isPrimaryActionDisabled = false,
  isPrevDisabled = false,
  onPrimaryAction,
  onPrevPart,
  prevActionLabel = 'Prev',
  primaryActionLabel = 'Next',
  test,
}: ReadingTestFooterProps) {
  const handlePrevAction = () => {
    onPrevPart();

    if (activePartEntry && activePartEntry.number > test.parts[0].number) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const handlePrimaryAction = () => {
    onPrimaryAction();
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const activePartEntry = test.parts.find((part) => part.number === activePart) ?? test.parts[0];
  const activePartAnswered = activePartEntry ? countPartAnswered(activePartEntry, answers) : 0;
  const activePartTotal = activePartEntry ? getPartQuestionIds(activePartEntry).length : 0;

  return (
    <footer className={cn(PRACTICE_FOOTER_SHELL_CLASS, 'sm:hidden')}>
      <div className={PRACTICE_FOOTER_TOP_BAR_CLASS} />
      <div className="relative z-10 mx-auto w-full max-w-345 px-3 py-2.5">
        <div className="flex items-center gap-2 sm:hidden">
          <button
            type="button"
            onClick={handlePrevAction}
            disabled={isPrevDisabled}
            className={cn(
              'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-stone-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300 dark:text-white/78 dark:shadow-none dark:hover:bg-white/12 dark:disabled:text-white/28 dark:disabled:hover:bg-white/8',
              PRACTICE_FOOTER_DARK_BUTTON_RING_CLASS
            )}
            aria-label={prevActionLabel}
          >
            <ChevronLeft className="size-5" strokeWidth={1.9} />
          </button>

          <section
            className={cn(
              'flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl px-3',
              PRACTICE_FOOTER_ACTIVE_SURFACE_CLASS
            )}
          >
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-stone-900 dark:text-white">
              Part {activePartEntry.number}
            </span>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-stone-500 dark:text-white/58">
              {activePartAnswered}/{activePartTotal}
            </span>
          </section>

          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={isPrimaryActionDisabled}
            className={cn(
              'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-stone-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300 dark:text-white/78 dark:shadow-none dark:hover:bg-white/12 dark:disabled:text-white/28 dark:disabled:hover:bg-white/8',
              PRACTICE_FOOTER_DARK_BUTTON_RING_CLASS
            )}
            aria-label={primaryActionLabel}
          >
            <ChevronRight className="size-5" strokeWidth={1.9} />
          </button>
        </div>
      </div>
    </footer>
  );
}
