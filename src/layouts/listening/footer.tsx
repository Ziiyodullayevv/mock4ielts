'use client';

import type { ListeningPartNumber } from './types';
import type { Answers, ListeningTest } from '../../sections/practice/listening/types';

import { cn } from '@/src/lib/utils';

import { getPartQuestions, countPartAnswered } from '../../sections/practice/listening/utils';

type ListeningTestFooterProps = {
  activePart: ListeningPartNumber;
  activeQuestionId: string | null;
  answers: Answers;
  onPartChange: (part: ListeningPartNumber) => void;
  onQuestionSelect: (part: ListeningPartNumber, questionId: string) => void;
  test: ListeningTest;
};

export function ListeningTestFooter({
  activePart,
  activeQuestionId,
  answers,
  onPartChange,
  onQuestionSelect,
  test,
}: ListeningTestFooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 bg-white border-t border border-border right-0 z-30">
      <div className="mx-auto relative z-10 max-w-6xl px-4 py-3">
        <div className="flex items-stretch gap-2.5">
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
                  onClick={() => onPartChange(part.number)}
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
                  onClick={() => onPartChange(part.number)}
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
                            ? 'border-blue-600 bg-blue-50 text-blue-600 ring-2 ring-blue-600/15 ring-offset-1'
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
