'use client';

import type { FlowStep } from '../../types';
import type { QuestionTypeAnnotationProps } from './annotation-blocks';

import { usePracticeTextSize, getPracticeTextStyle } from '@/src/sections/practice/shared/practice-text-size';

import { CompletionInput } from './completion-input';
import { getListeningQuestionAnchorId } from '../../utils';
import { renderQuestionText, getQuestionAnnotationBlockId } from './annotation-blocks';
import {
  PaperPanel,
  QuestionNumberBadge,
  PAPER_ROW_CLASS_NAME,
  PAPER_DIVIDER_CLASS_NAME,
} from './paper-shell';

interface Props extends QuestionTypeAnnotationProps {
  activeQuestionId?: string | null;
  chartTitle: string;
  steps: FlowStep[];
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function FlowChart({
  activeQuestionId,
  annotationBlockIdPrefix,
  chartTitle,
  steps,
  answers,
  onChange,
  renderAnnotatedTextBlock,
  showAnswer,
}: Props) {
  const textSize = usePracticeTextSize();

  return (
    <PaperPanel
      title={chartTitle}
      titleContent={renderQuestionText({
        as: 'span',
        blockId: getQuestionAnnotationBlockId(annotationBlockIdPrefix, 'title'),
        renderAnnotatedTextBlock,
        text: chartTitle,
      })}
    >
      <div className={PAPER_DIVIDER_CLASS_NAME}>
        {steps.map((step, i) => {
          const isActiveQuestion = step.id === activeQuestionId;

          if (!step.isBlank && step.content === '↓') {
            return (
              <div key={i} className="flex justify-center px-5 py-3 text-xl text-stone-500 dark:text-white/36 sm:px-8">
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
                <div
                  style={getPracticeTextStyle(textSize, 'body')}
                  className="mx-auto max-w-2xl text-center text-stone-800 dark:text-white/84"
                >
                  <QuestionNumberBadge
                    isActive={isActiveQuestion}
                    number={step.number!}
                    size="xs"
                    className="mr-1.5"
                  />
                  {step.content ? (
                    step.content.split('_______').map((part, pi, arr) => (
                      <span key={pi}>
                        {part
                          ? renderQuestionText({
                              as: 'span',
                              blockId: getQuestionAnnotationBlockId(
                                annotationBlockIdPrefix,
                                'step',
                                i,
                                'segment',
                                pi
                              ),
                              renderAnnotatedTextBlock,
                              text: part,
                            })
                          : null}
                        {pi < arr.length - 1 && (
                          <CompletionInput
                            annotationBlockIdPrefix={annotationBlockIdPrefix}
                            field={{
                              id: step.id!,
                              number: step.number!,
                              label: '',
                              answerLength: step.answerLength!,
                              answer: step.answer!,
                            }}
                            value={answers[step.id!] ?? ''}
                            onChange={onChange}
                            renderAnnotatedTextBlock={renderAnnotatedTextBlock}
                            showAnswer={showAnswer}
                          />
                        )}
                      </span>
                    ))
                  ) : (
                    <CompletionInput
                      annotationBlockIdPrefix={annotationBlockIdPrefix}
                      field={{
                        id: step.id!,
                        number: step.number!,
                        label: '',
                        answerLength: step.answerLength!,
                        answer: step.answer!,
                      }}
                      value={answers[step.id!] ?? ''}
                      onChange={onChange}
                      renderAnnotatedTextBlock={renderAnnotatedTextBlock}
                      showAnswer={showAnswer}
                    />
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={i} className={PAPER_ROW_CLASS_NAME}>
              <div
                style={getPracticeTextStyle(textSize, 'body')}
                className="mx-auto max-w-2xl text-center text-stone-800 dark:text-white/84"
              >
                {step.content
                  ? renderQuestionText({
                      as: 'span',
                      blockId: getQuestionAnnotationBlockId(
                        annotationBlockIdPrefix,
                        'step',
                        i,
                        'text'
                      ),
                      renderAnnotatedTextBlock,
                      text: step.content,
                    })
                  : null}
              </div>
            </div>
          );
        })}
      </div>
    </PaperPanel>
  );
}
