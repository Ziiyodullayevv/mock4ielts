'use client';

import type { Answers, ReadingTest } from '@/src/sections/practice/reading/types';
import type { ReadingPartNumber } from './types';

import { cn } from '@/src/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPartQuestions, countPartAnswered } from '@/src/sections/practice/reading/utils';
import {
  PRACTICE_FOOTER_SHELL_CLASS,
  PRACTICE_FOOTER_TOP_BAR_CLASS,
  PRACTICE_FOOTER_ACTIVE_BUTTON_CLASS,
  PRACTICE_FOOTER_ACTIVE_SURFACE_CLASS,
  PRACTICE_FOOTER_INACTIVE_SURFACE_CLASS,
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
  activeQuestionId,
  answers,
  isPrimaryActionDisabled = false,
  isPrevDisabled = false,
  onPrimaryAction,
  onPartChange,
  onPrevPart,
  onQuestionSelect,
  prevActionLabel = 'Prev',
  primaryActionLabel = 'Next',
  test,
}: ReadingTestFooterProps) {
  const handlePartSelect = (part: ReadingPartNumber) => {
    onPartChange(part);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

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
  const activePartQuestions = activePartEntry ? getPartQuestions(activePartEntry) : [];

  return (
    <footer className={PRACTICE_FOOTER_SHELL_CLASS}>
      <div className={PRACTICE_FOOTER_TOP_BAR_CLASS} />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-3">
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

          {activePartEntry ? (
            <section
              className={cn(
                'min-w-0 flex h-11 flex-1 items-center overflow-hidden rounded-xl px-1.5',
                PRACTICE_FOOTER_INACTIVE_SURFACE_CLASS
              )}
            >
              <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-max items-center gap-1">
                  {activePartQuestions.map((question) => {
                    const isCurrentQuestion = question.id === activeQuestionId;
                    const isAnswered = Boolean((answers[question.id] ?? '').trim());

                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => onQuestionSelect(activePartEntry.number, question.id)}
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold transition-colors',
                          isCurrentQuestion
                            ? PRACTICE_FOOTER_ACTIVE_BUTTON_CLASS
                            : isAnswered
                              ? 'border-none bg-black text-white hover:bg-black dark:bg-black dark:text-white dark:hover:bg-black'
                              : cn('border border-stone-300 bg-stone-200 text-stone-700 hover:bg-stone-300 dark:text-white/78 dark:hover:bg-transparent', PRACTICE_FOOTER_DARK_BUTTON_RING_CLASS)
                        )}
                        aria-current={isCurrentQuestion ? 'step' : undefined}
                      >
                        <span>{question.number}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null}

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

        <div className="hidden sm:block md:hidden">
          <div className="-mx-1 overflow-x-auto px-1">
            <div className="flex min-w-max items-stretch gap-2">
              {test.parts.map((part) => {
                const questions = getPartQuestions(part);
                const answeredCount = countPartAnswered(part, answers);
                const hasActiveQuestion = questions.some(
                  (question) => question.id === activeQuestionId
                );
                const isActive = activePart === part.number || hasActiveQuestion;

                return (
                  <button
                    key={part.number}
                    type="button"
                    onClick={() => handlePartSelect(part.number)}
                    className={cn(
                      'flex shrink-0 flex-col rounded-xl px-3 py-2 text-left transition-colors',
                      isActive
                        ? PRACTICE_FOOTER_ACTIVE_SURFACE_CLASS
                        : PRACTICE_FOOTER_INACTIVE_SURFACE_CLASS
                    )}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500 dark:text-white/48">
                      Part {part.number}
                    </span>
                    <span className="mt-1 text-sm font-medium text-stone-900 dark:text-white">
                      {answeredCount}/{questions.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="hidden items-stretch gap-2.5 md:flex">
          {test.parts.map((part) => {
            const questions = getPartQuestions(part);
            const answeredCount = countPartAnswered(part, answers);
            const hasActiveQuestion = questions.some(
              (question) => question.id === activeQuestionId
            );
            const isActive = activePart === part.number || hasActiveQuestion;

            if (!isActive) {
              return (
                <button
                  key={part.number}
                  type="button"
                  onClick={() => handlePartSelect(part.number)}
                  className={cn('flex min-w-0 flex-[0.9] items-center rounded-xl px-3 py-2 text-left transition-colors', PRACTICE_FOOTER_INACTIVE_SURFACE_CLASS)}
                >
                  <div className="flex min-w-0 items-baseline gap-2 text-sm">
                    <span className="shrink-0 font-semibold text-stone-900 dark:text-white">
                      Part {part.number}:
                    </span>
                    <span className="truncate text-stone-600 dark:text-white/62">
                      {answeredCount} of {questions.length} questions
                    </span>
                  </div>
                </button>
              );
            }

            return (
              <section
                key={part.number}
                className={cn(
                  'flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5',
                  PRACTICE_FOOTER_ACTIVE_SURFACE_CLASS
                )}
              >
                <button
                  type="button"
                  onClick={() => handlePartSelect(part.number)}
                  className="shrink-0 text-left"
                  aria-current={hasActiveQuestion ? 'step' : undefined}
                >
                  <span className="text-sm font-semibold text-stone-900 dark:text-white">Part {part.number}</span>
                </button>

                <div className="flex items-center gap-1">
                  {questions.map((question) => {
                    const isCurrentQuestion = question.id === activeQuestionId;
                    const isAnswered = Boolean((answers[question.id] ?? '').trim());

                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onQuestionSelect(part.number, question.id);
                        }}
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold transition-colors',
                          isCurrentQuestion
                            ? PRACTICE_FOOTER_ACTIVE_BUTTON_CLASS
                            : isAnswered
                              ? 'border-none bg-black text-white hover:bg-black dark:bg-black dark:text-white dark:hover:bg-black'
                              : isActive
                                ? cn('border border-stone-300 bg-stone-200 text-stone-700 hover:bg-stone-300 dark:text-white/78 dark:hover:bg-transparent', PRACTICE_FOOTER_DARK_BUTTON_RING_CLASS)
                                : cn('border border-stone-200 bg-stone-100 text-stone-600 hover:bg-stone-200 dark:text-white/58 dark:hover:bg-transparent', PRACTICE_FOOTER_DARK_BUTTON_RING_CLASS)
                        )}
                        aria-current={isCurrentQuestion ? 'step' : undefined}
                      >
                        <span>{question.number}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
