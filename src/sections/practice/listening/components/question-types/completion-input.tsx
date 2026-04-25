'use client';

import type { BlankField } from '../../types';
import type { QuestionTypeAnnotationProps } from './annotation-blocks';

import { usePracticeTextSize, getPracticeTextStyle } from '@/src/sections/practice/shared/practice-text-size';

import { isAnswerCorrect, getPrimaryAnswer } from '../../utils';
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

  const inputWidth = Math.max(92, field.answerLength * 12 + 18);
  const primaryAnswer = getPrimaryAnswer(field.answer);
  return (
    <span className="inline-flex items-center gap-1.5 align-middle">
      {field.label && (
        renderQuestionText({
          as: 'span',
          blockId: getQuestionAnnotationBlockId(
            annotationBlockIdPrefix,
            'field',
            field.id,
            'label'
          ),
          className: 'whitespace-nowrap text-stone-700 dark:text-white/72',
          renderAnnotatedTextBlock,
          style: getPracticeTextStyle(textSize, 'body'),
          text: field.label,
        })
      )}
      <span className="inline-flex flex-col items-start">
        <input
          data-question-focus="true"
          type="text"
          name={`listening-answer-${field.id}`}
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
          disabled={showAnswer}
          maxLength={field.answerLength + 6}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          style={{
            ...getPracticeTextStyle(textSize, 'body-soft'),
            width: inputWidth,
          }}
          className={[
            'border-b-2 border-dotted bg-transparent px-1 pb-0.5 text-stone-900 outline-none transition-[border-color,border-style] placeholder:text-stone-500/70 focus:border-solid focus-visible:border-solid dark:text-white dark:placeholder:text-white/32',
            showAnswer
              ? isCorrect
                ? 'border-green-600 text-green-700'
                : 'border-red-500 text-red-600'
              : 'border-stone-500 focus:border-stone-900 dark:border-white/34 dark:focus:border-white',
          ].join(' ')}
        />
        {showAnswer && !isCorrect && (
          <span className="mt-1 whitespace-nowrap text-xs font-medium text-green-700">
            ✓ {primaryAnswer}
          </span>
        )}
      </span>
      {field.suffix && (
        renderQuestionText({
          as: 'span',
          blockId: getQuestionAnnotationBlockId(
            annotationBlockIdPrefix,
            'field',
            field.id,
            'suffix'
          ),
          className: 'whitespace-nowrap text-stone-700 dark:text-white/72',
          renderAnnotatedTextBlock,
          style: getPracticeTextStyle(textSize, 'body'),
          text: field.suffix,
        })
      )}
    </span>
  );
}
