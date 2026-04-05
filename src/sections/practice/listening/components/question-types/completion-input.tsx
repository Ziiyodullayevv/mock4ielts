'use client';

import type { BlankField } from '../../types';

import { isAnswerCorrect, getPrimaryAnswer } from '../../utils';

interface CompletionInputProps {
  field: BlankField;
  value: string;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function CompletionInput({ field, value, onChange, showAnswer }: CompletionInputProps) {
  const isCorrect = showAnswer ? isAnswerCorrect(value, field.answer) : undefined;

  const inputWidth = Math.max(92, field.answerLength * 12 + 18);
  const primaryAnswer = getPrimaryAnswer(field.answer);
  return (
    <span className="inline-flex items-center gap-1.5 align-middle">
      {field.label && (
        <span className="whitespace-nowrap text-[1.05rem] text-stone-700">
          {field.label}
        </span>
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
          style={{ width: inputWidth }}
          className={[
            'border-b-2 border-dotted bg-transparent px-1 pb-0.5 text-[1.02rem] text-stone-900 outline-none transition-[border-color,border-style] placeholder:text-stone-500/70 focus:border-solid focus-visible:border-solid',
            showAnswer
              ? isCorrect
                ? 'border-green-600 text-green-700'
                : 'border-red-500 text-red-600'
              : 'border-stone-500 focus:border-stone-900',
          ].join(' ')}
        />
        {showAnswer && !isCorrect && (
          <span className="mt-1 whitespace-nowrap text-xs font-medium text-green-700">
            ✓ {primaryAnswer}
          </span>
        )}
      </span>
      {field.suffix && (
        <span className="whitespace-nowrap text-[1.05rem] text-stone-700">
          {field.suffix}
        </span>
      )}
    </span>
  );
}
