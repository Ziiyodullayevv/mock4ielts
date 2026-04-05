'use client';

import type { BlankField, SummaryParagraph } from '../../types';

import { useState } from 'react';

import { CompletionInput } from './completion-input';
import { useDragAutoScroll } from './use-drag-auto-scroll';
import { PaperPanel, QuestionNumberBadge } from './paper-shell';
import { isAnswerCorrect, getPrimaryAnswer, getListeningQuestionAnchorId } from '../../utils';

interface Props {
  activeQuestionId?: string | null;
  paragraphs: SummaryParagraph[];
  summaryTitle?: string;
  wordBank?: string[];
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function SummaryCompletion({
  activeQuestionId,
  paragraphs,
  summaryTitle,
  wordBank = [],
  answers,
  onChange,
  showAnswer,
}: Props) {
  const [dragging, setDragging] = useState<string | null>(null);
  const hasWordBank = wordBank.length > 0;
  const fields = paragraphs.flatMap((paragraph) =>
    paragraph.segments.flatMap((segment) => (segment.type === 'blank' ? [segment.field] : []))
  );
  const usedWords = fields.map((field) => answers[field.id]).filter(Boolean);

  useDragAutoScroll(Boolean(dragging) && !showAnswer && hasWordBank);

  const handleDrop = (fieldId: string, word: string) => {
    const existing = answers[fieldId];
    if (existing) onChange(fieldId, '');
    onChange(fieldId, word);
    setDragging(null);
  };

  return (
    <div className="space-y-5">
      {hasWordBank && !showAnswer ? (
        <div className="bg-[#f7f7f7] p-4 sm:p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Word bank
          </p>
          <div className="flex flex-wrap gap-2">
            {wordBank.map((word) => (
              <div
                key={word}
                draggable
                onDragStart={() => setDragging(word)}
                onDragEnd={() => setDragging(null)}
                className={`px-4 py-2 text-sm font-medium select-none transition-all ${
                  usedWords.includes(word)
                    ? 'cursor-not-allowed bg-white/25 text-stone-400 opacity-30'
                    : dragging === word
                      ? 'cursor-grabbing bg-stone-900 text-white opacity-50'
                      : 'cursor-grab bg-white/55 text-stone-700 hover:bg-white'
                }`}
              >
                {word}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <PaperPanel title={summaryTitle ?? 'Summary'}>
        <div className="divide-y divide-[#dfdfdf]">
          {paragraphs.map((paragraph, paragraphIndex) => (
            <section key={`${paragraph.heading ?? 'summary'}-${paragraphIndex}`}>
              {paragraph.heading ? (
                <div className="border-b border-[#dfdfdf] px-5 py-4 sm:px-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    {paragraph.heading}
                  </p>
                </div>
              ) : null}

              <div className="px-5 py-4 sm:px-8 sm:py-5">
                <p className="text-[1.05rem] leading-9 text-stone-800">
                  {paragraph.segments.map((segment, segmentIndex) =>
                    segment.type === 'text' ? (
                      <span key={`text-${paragraphIndex}-${segmentIndex}`}>{segment.content}</span>
                    ) : (
                      <SummaryBlank
                        key={segment.field.id}
                        activeQuestionId={activeQuestionId}
                        answers={answers}
                        dragging={dragging}
                        field={segment.field}
                        hasWordBank={hasWordBank}
                        onChange={onChange}
                        onDrop={handleDrop}
                        showAnswer={showAnswer}
                      />
                    )
                  )}
                </p>
              </div>
            </section>
          ))}
        </div>
      </PaperPanel>
    </div>
  );
}

type SummaryBlankProps = {
  activeQuestionId?: string | null;
  answers: Record<string, string>;
  dragging: string | null;
  field: BlankField;
  hasWordBank: boolean;
  onChange: (id: string, value: string) => void;
  onDrop: (fieldId: string, word: string) => void;
  showAnswer?: boolean;
};

function SummaryBlank({
  activeQuestionId,
  answers,
  dragging,
  field,
  hasWordBank,
  onChange,
  onDrop,
  showAnswer,
}: SummaryBlankProps) {
  const value = answers[field.id] ?? '';
  const isActive = field.id === activeQuestionId;
  const isCorrect = showAnswer ? isAnswerCorrect(value, field.answer) : undefined;
  const primaryAnswer = getPrimaryAnswer(field.answer);

  if (!hasWordBank) {
    return (
      <span
        id={getListeningQuestionAnchorId(field.id)}
        className="inline-flex scroll-mt-28 items-center gap-2 align-baseline"
      >
        <QuestionNumberBadge isActive={isActive} number={field.number} size="xs" />
        <CompletionInput
          field={{ ...field, label: '' }}
          value={value}
          onChange={onChange}
          showAnswer={showAnswer}
        />
      </span>
    );
  }

  let blankClassName =
    'inline-flex min-h-10 min-w-[10rem] items-center justify-center gap-1.5 rounded-md border border-dashed border-sky-400 bg-sky-100 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-sky-800 align-baseline shadow-[inset_0_0_0_1px_rgba(125,211,252,0.45)] transition-colors';

  if (showAnswer) {
    blankClassName = isCorrect
      ? 'inline-flex min-h-10 min-w-[10rem] items-center justify-between rounded-sm border border-green-300 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 align-baseline'
      : 'inline-flex min-h-10 min-w-[10rem] items-center justify-between rounded-sm border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 align-baseline';
  } else if (isActive) {
    blankClassName =
      'inline-flex min-h-10 min-w-[10rem] items-center justify-center gap-1.5 rounded-md border border-dashed border-sky-500 bg-sky-200 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-sky-900 align-baseline shadow-[0_0_0_1px_rgba(56,189,248,0.16)]';
  } else if (value) {
    blankClassName =
      'inline-flex min-h-10 min-w-[10rem] items-center justify-between rounded-sm border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-900 align-baseline';
  }

  if (!showAnswer && dragging && !value) {
    blankClassName =
      'inline-flex min-h-10 min-w-[10rem] items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-sky-600 bg-sky-100 px-3 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-sky-950 align-baseline shadow-[0_0_0_4px_rgba(56,189,248,0.14)] transition-all';
  }

  return (
    <span
      id={getListeningQuestionAnchorId(field.id)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => dragging && onDrop(field.id, dragging)}
      className="inline-flex scroll-mt-28 items-center gap-2 align-baseline"
    >
      <QuestionNumberBadge isActive={isActive} number={field.number} size="xs" />

      <button
        type="button"
        data-question-focus={!showAnswer ? 'true' : undefined}
        tabIndex={showAnswer ? -1 : 0}
        onClick={() => {
          if (!showAnswer && value) {
            onChange(field.id, '');
          }
        }}
        className={blankClassName}
      >
        <span>
          {value ? (
            value
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-current opacity-70" />
              <span>DROP HERE</span>
            </span>
          )}
        </span>
        {!showAnswer && value ? <span className="ml-2 text-stone-400">✕</span> : null}
      </button>

      {showAnswer && !isCorrect ? (
        <span className="text-sm font-medium text-green-700">✓ {primaryAnswer}</span>
      ) : null}
    </span>
  );
}
