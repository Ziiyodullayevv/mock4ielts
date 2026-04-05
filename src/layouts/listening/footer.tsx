'use client';

import type { ListeningPartNumber } from './types';
import type { Answers, ListeningTest } from '../../sections/practice/listening/types';

import { cn } from '@/src/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { getPartQuestions, countPartAnswered } from '../../sections/practice/listening/utils';

type ListeningTestFooterProps = {
  activePart: ListeningPartNumber;
  activeQuestionId: string | null;
  answers: Answers;
  isPrimaryActionDisabled?: boolean;
  isPrevDisabled?: boolean;
  onPrimaryAction: () => void;
  onPartChange: (part: ListeningPartNumber) => void;
  onPrevPart: () => void;
  onQuestionSelect: (part: ListeningPartNumber, questionId: string) => void;
  prevActionLabel?: string;
  primaryActionLabel?: string;
  test: ListeningTest;
};

export function ListeningTestFooter({
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
}: ListeningTestFooterProps) {
  const handlePartSelect = (part: ListeningPartNumber) => {
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
    <footer className="fixed bottom-0 left-0 bg-white border-t border border-border right-0 z-30">
      <div className="mx-auto relative z-10 max-w-6xl px-4 py-3">
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

          {activePartEntry ? (
            <section className="min-w-0 flex h-11 flex-1 items-center overflow-hidden rounded-xl border border-border/60 bg-white px-1.5 shadow-sm">
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
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-[11px] font-semibold transition-colors',
                          isCurrentQuestion
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : isAnswered
                              ? 'border-stone-900 bg-stone-900 text-white'
                              : 'border-stone-300 bg-stone-200 text-stone-700 hover:bg-stone-300'
                        )}
                        aria-current={isCurrentQuestion ? 'step' : undefined}
                      >
                        {question.number}
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
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-white text-stone-700 shadow-sm transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-white"
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
                      'flex shrink-0 flex-col rounded-xl border px-3 py-2 text-left transition-colors',
                      isActive
                        ? 'border-black/80 bg-stone-100 shadow-md'
                        : 'border-border/60 bg-white hover:bg-stone-50'
                    )}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
                      Part {part.number}
                    </span>
                    <span className="mt-1 text-sm font-medium text-stone-900">
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
                  className="flex min-w-0 flex-[0.9] items-center rounded-xl shadow-md/5 border border-border/50 hover:cursor-pointer bg-white px-3 py-2 text-left transition-colors hover:bg-stone-50"
                >
                  <div className="flex min-w-0 items-baseline gap-2 text-sm">
                    <span className="shrink-0 font-semibold text-stone-900">
                      Part {part.number}:
                    </span>
                    <span className="truncate text-stone-600">
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
                  'flex shrink-0 items-center gap-3 rounded-xl border-2 bg-stone-100 border-black/80 px-3 py-2.5 shadow-lg'
                )}
              >
                <button
                  type="button"
                  onClick={() => handlePartSelect(part.number)}
                  className="shrink-0 text-left"
                  aria-current={hasActiveQuestion ? 'step' : undefined}
                >
                  <span className="text-sm font-semibold text-stone-900">Part {part.number}</span>
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
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-[11px] font-semibold transition-colors',
                          isCurrentQuestion
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : isAnswered
                              ? 'border-stone-900 bg-stone-900 text-white'
                              : isActive
                                ? 'border-stone-300 bg-stone-200 text-stone-700 hover:bg-stone-300'
                                : 'border-stone-200 bg-stone-100 text-stone-600 hover:bg-stone-200'
                        )}
                        aria-current={isCurrentQuestion ? 'step' : undefined}
                      >
                        {question.number}
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
