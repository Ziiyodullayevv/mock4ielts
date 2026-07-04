'use client';

import type { BlankField } from '../../types';
import type { QuestionTypeAnnotationProps } from './annotation-blocks';

import { XCircle, CheckCircle2 } from 'lucide-react';
import {
  usePracticeTextSize,
  getPracticeTextStyle,
} from '@/src/sections/practice/shared/practice-text-size';

import { isAnswerCorrect, formatCorrectAnswer } from '../../utils';
import { REVIEW_STYLE, getReviewValueLabel } from './review-styles';
import { renderQuestionText, getQuestionAnnotationBlockId } from './annotation-blocks';

interface CompletionInputProps extends QuestionTypeAnnotationProps {
  field: BlankField;
  value: string;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function CompletionInput({
  annotationBlockIdPrefix,
  field,
  renderAnnotatedTextBlock,
  value,
  onChange,
  showAnswer,
}: CompletionInputProps) {
  const textSize = usePracticeTextSize();
  const isCorrect = showAnswer ? isAnswerCorrect(value, field.answer) : undefined;

  const correctAnswer = formatCorrectAnswer(field.answer);
  const expectedAnswerLength = correctAnswer
    .split(/\s*(?:\/|\||;|\bor\b)\s*/i)
    .reduce((longestLength, answer) => Math.max(longestLength, answer.trim().length), 0);
  const visibleCharacterCount = Math.max(
    10,
    field.answerLength,
    expectedAnswerLength,
    value.length
  );
  const inputWidth = Math.max(128, visibleCharacterCount * 10 + 36);

  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 align-middle">
      {field.label &&
        renderQuestionText({
          as: 'span',
          blockId: getQuestionAnnotationBlockId(
            annotationBlockIdPrefix,
            'field',
            field.id,
            'label'
          ),
          className: 'whitespace-normal break-words text-stone-700 dark:text-white/72',
          renderAnnotatedTextBlock,
          style: getPracticeTextStyle(textSize, 'body'),
          text: field.label,
        })}
      <span className="inline-flex flex-col items-start">
        {showAnswer ? (
          <span className="inline-flex flex-col items-start gap-1.5">
            <span
              style={getPracticeTextStyle(textSize, 'body-compact')}
              className={[
                'inline-flex min-h-9 max-w-[18rem] items-center gap-2 rounded-full border px-3 py-1.5 font-semibold shadow-sm',
                isCorrect ? REVIEW_STYLE.correctBadge : REVIEW_STYLE.wrongBadge,
              ].join(' ')}
            >
              {isCorrect ? (
                <CheckCircle2 className="size-4 shrink-0" strokeWidth={2.5} />
              ) : (
                <XCircle className="size-4 shrink-0" strokeWidth={2.5} />
              )}
              <span className="truncate">{isCorrect ? value : getReviewValueLabel(value)}</span>
            </span>

            {!isCorrect && (
              <span
                className={`inline-flex max-w-[22rem] items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${REVIEW_STYLE.correctBadge}`}
              >
                <CheckCircle2 className="size-3.5 shrink-0" strokeWidth={2.5} />
                <span className="truncate">Correct: {correctAnswer}</span>
              </span>
            )}
          </span>
        ) : (
          <input
            data-question-focus="true"
            type="text"
            name={`listening-answer-${field.id}`}
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            style={{
              ...getPracticeTextStyle(textSize, 'body-soft'),
              width: inputWidth,
              fieldSizing: 'content',
            }}
            className="min-w-[8rem] max-w-none shrink-0 border-b-2 border-dotted border-stone-500 bg-transparent px-1 pb-0.5 text-stone-900 outline-none transition-[border-color,border-style,width] placeholder:text-stone-500/70 focus:border-[#ff9f2f] focus:border-solid dark:border-white/34 dark:text-white dark:placeholder:text-white/32 dark:focus:border-[#ffb347]"
          />
        )}
      </span>
      {field.suffix &&
        renderQuestionText({
          as: 'span',
          blockId: getQuestionAnnotationBlockId(
            annotationBlockIdPrefix,
            'field',
            field.id,
            'suffix'
          ),
          className: 'whitespace-normal break-words text-stone-700 dark:text-white/72',
          renderAnnotatedTextBlock,
          style: getPracticeTextStyle(textSize, 'body'),
          text: field.suffix,
        })}
    </span>
  );
}
