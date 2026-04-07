'use client';

import type { WritingTest, WritingAnswers } from '@/src/sections/practice/writing/types';
import type { WritingPartNumber } from './types';

import { cn } from '@/src/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { countWords } from '@/src/sections/practice/writing/utils';

type WritingTestFooterProps = {
  activePart: WritingPartNumber;
  answers: WritingAnswers;
  isPrimaryActionDisabled?: boolean;
  isPrevDisabled?: boolean;
  onPrimaryAction: () => void;
  onPartChange: (part: WritingPartNumber) => void;
  onPrevPart: () => void;
  prevActionLabel?: string;
  primaryActionLabel?: string;
  test: WritingTest;
};

export function WritingTestFooter({
  activePart,
  answers,
  isPrimaryActionDisabled = false,
  isPrevDisabled = false,
  onPrimaryAction,
  onPartChange,
  onPrevPart,
  prevActionLabel = 'Prev',
  primaryActionLabel = 'Next',
  test,
}: WritingTestFooterProps) {
  const handlePartSelect = (part: WritingPartNumber) => {
    onPartChange(part);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handlePrevAction = () => {
    onPrevPart();
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handlePrimaryAction = () => {
    onPrimaryAction();
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <footer className="fixed right-0 bottom-0 left-0 z-30 border-t border-border bg-white">
      <div className="relative z-10 mx-auto max-w-345 px-4 py-3">
        {/* Mobile */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            type="button"
            onClick={handlePrevAction}
            disabled={isPrevDisabled}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-white text-stone-700 shadow-sm transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-white"
            aria-label={prevActionLabel}
          >
            <ChevronLeft className="size-5" strokeWidth={1.9} />
          </button>

          <div className="flex h-11 min-w-0 flex-1 items-center gap-1 rounded-xl border border-border/60 bg-white px-1.5 shadow-sm">
            {test.parts.map((part) => {
              const words = countWords(answers[part.task.id] ?? '');
              const isActive = activePart === part.number;

              return (
                <button
                  key={part.number}
                  type="button"
                  onClick={() => handlePartSelect(part.number)}
                  className={cn(
                    'flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition-colors',
                    isActive
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-stone-300 bg-stone-100 text-stone-700 hover:bg-stone-200'
                  )}
                >
                  <span>{part.title}</span>
                  <span className={cn('tabular-nums', isActive ? 'opacity-80' : 'opacity-60')}>
                    {words}w
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={isPrimaryActionDisabled}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-white text-stone-700 shadow-sm transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-white"
            aria-label={primaryActionLabel}
          >
            <ChevronRight className="size-5" strokeWidth={1.9} />
          </button>
        </div>

        {/* Desktop */}
        <div className="hidden items-stretch gap-2.5 sm:flex">
          {test.parts.map((part) => {
            const words = countWords(answers[part.task.id] ?? '');
            const isActive = activePart === part.number;
            const meetsMinimum = words >= part.task.wordLimitMin;

            if (!isActive) {
              return (
                <button
                  key={part.number}
                  type="button"
                  onClick={() => handlePartSelect(part.number)}
                  className="flex min-w-0 flex-[0.9] items-center rounded-xl border border-border/50 bg-white px-3 py-2 text-left shadow-md/5 transition-colors hover:cursor-pointer hover:bg-stone-50"
                >
                  <div className="flex min-w-0 items-baseline gap-2 text-sm">
                    <span className="shrink-0 font-semibold text-stone-900">{part.title}:</span>
                    <span
                      className={cn(
                        'truncate',
                        meetsMinimum ? 'text-emerald-600' : 'text-stone-500'
                      )}
                    >
                      {words} / {part.task.wordLimitMin} words
                    </span>
                  </div>
                </button>
              );
            }

            return (
              <section
                key={part.number}
                className="flex shrink-0 items-center gap-3 rounded-xl border-2 border-black/80 bg-stone-100 px-3 py-2.5 shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => handlePartSelect(part.number)}
                  className="shrink-0 text-left"
                >
                  <span className="text-sm font-semibold text-stone-900">{part.title}</span>
                </button>

                <div
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold tabular-nums',
                    meetsMinimum ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'
                  )}
                >
                  <span>{words}</span>
                  <span className="opacity-60">/</span>
                  <span className="opacity-60">{part.task.wordLimitMin}</span>
                  <span className="opacity-60">words</span>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
