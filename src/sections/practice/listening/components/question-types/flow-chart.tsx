'use client';

import type { FlowStep } from '../../types';

import { CompletionInput } from './completion-input';
import { getListeningQuestionAnchorId } from '../../utils';
import {
  PaperPanel,
  QuestionNumberBadge,
  PAPER_ROW_CLASS_NAME,
  PAPER_DIVIDER_CLASS_NAME,
} from './paper-shell';

interface Props {
  activeQuestionId?: string | null;
  chartTitle: string;
  steps: FlowStep[];
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function FlowChart({
  activeQuestionId,
  chartTitle,
  steps,
  answers,
  onChange,
  showAnswer,
}: Props) {
  return (
    <PaperPanel title={chartTitle}>
      <div className={PAPER_DIVIDER_CLASS_NAME}>
        {steps.map((step, i) => {
          const isActiveQuestion = step.id === activeQuestionId;

          if (!step.isBlank && step.content === '↓') {
            return (
              <div key={i} className="flex justify-center px-5 py-3 text-xl text-stone-500 sm:px-8">
                <span aria-hidden="true">↓</span>
              </div>
            );
          }

          if (step.isBlank) {
            return (
              <div
                key={i}
                id={getListeningQuestionAnchorId(step.id!)}
                className={`${PAPER_ROW_CLASS_NAME} scroll-mt-28`}
              >
                <div className="mx-auto max-w-2xl text-center text-[1.03rem] leading-8 text-stone-800">
                  <QuestionNumberBadge
                    isActive={isActiveQuestion}
                    number={step.number!}
                    size="xs"
                    className="mr-1.5"
                  />
                  {step.content ? (
                    step.content.split('_______').map((part, pi, arr) => (
                      <span key={pi}>
                        {part}
                        {pi < arr.length - 1 && (
                          <CompletionInput
                            field={{
                              id: step.id!,
                              number: step.number!,
                              label: '',
                              answerLength: step.answerLength!,
                              answer: step.answer!,
                            }}
                            value={answers[step.id!] ?? ''}
                            onChange={onChange}
                            showAnswer={showAnswer}
                          />
                        )}
                      </span>
                    ))
                  ) : (
                    <CompletionInput
                      field={{
                        id: step.id!,
                        number: step.number!,
                        label: '',
                        answerLength: step.answerLength!,
                        answer: step.answer!,
                      }}
                      value={answers[step.id!] ?? ''}
                      onChange={onChange}
                      showAnswer={showAnswer}
                    />
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={i} className={PAPER_ROW_CLASS_NAME}>
              <div className="mx-auto max-w-2xl text-center text-[1.03rem] leading-8 text-stone-800">
                {step.content}
              </div>
            </div>
          );
        })}
      </div>
    </PaperPanel>
  );
}
