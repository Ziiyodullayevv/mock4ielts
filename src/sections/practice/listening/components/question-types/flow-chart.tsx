'use client';

import type { FlowStep } from '../../types';

import { PaperPanel } from './paper-shell';
import { CompletionInput } from './completion-input';
import { getListeningQuestionAnchorId } from '../../utils';

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
      <div className="flex flex-col items-center px-6 py-6">
        {steps.map((step, i) => {
          const isActiveQuestion = step.id === activeQuestionId;

          if (!step.isBlank && step.content === '↓') {
            return (
              <div key={i} className="py-2 text-xl text-stone-500">
                ↓
              </div>
            );
          }

          if (step.isBlank) {
            return (
              <div
                key={i}
                id={getListeningQuestionAnchorId(step.id!)}
                className="w-full max-w-2xl scroll-mt-28 bg-white/55 px-5 py-4 text-center text-[1.03rem] leading-8 text-stone-800"
              >
                <span
                  className={`mr-1 font-semibold ${
                    isActiveQuestion ? 'text-blue-600' : 'text-stone-800'
                  }`}
                >
                  ({step.number})
                </span>
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
            );
          }

          return (
            <div
              key={i}
              className="w-full max-w-2xl bg-white/55 px-5 py-4 text-center text-[1.03rem] leading-8 text-stone-800"
            >
              {step.content}
            </div>
          );
        })}
      </div>
    </PaperPanel>
  );
}
