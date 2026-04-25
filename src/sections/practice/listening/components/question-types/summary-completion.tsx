'use client';

import type { BlankField, SummaryParagraph } from '../../types';
import type { QuestionTypeAnnotationProps } from './annotation-blocks';

import { useState } from 'react';
import { usePracticeTextSize, getPracticeTextStyle } from '@/src/sections/practice/shared/practice-text-size';

import { CompletionInput } from './completion-input';
import { useDragAutoScroll } from './use-drag-auto-scroll';
import { PaperPanel, QuestionNumberBadge } from './paper-shell';
import { renderQuestionText, getQuestionAnnotationBlockId } from './annotation-blocks';
import { isAnswerCorrect, getPrimaryAnswer, getListeningQuestionAnchorId } from '../../utils';

interface Props extends QuestionTypeAnnotationProps {
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
  annotationBlockIdPrefix,
  paragraphs,
  summaryTitle,
  wordBank = [],
  answers,
  onChange,
  renderAnnotatedTextBlock,
  showAnswer,
}: Props) {
  const textSize = usePracticeTextSize();
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
        <div className="bg-[#f7f7f7] p-4 dark:bg-[#131313] sm:p-5">
          {renderQuestionText({
            as: 'p',
            blockId: getQuestionAnnotationBlockId(annotationBlockIdPrefix, 'word-bank-title'),
            className: 'mb-3 font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-white/42',
            renderAnnotatedTextBlock,
            style: getPracticeTextStyle(textSize, 'eyebrow'),
            text: 'Word bank',
          })}
          <div className="flex flex-wrap gap-2">
            {wordBank.map((word, wordIndex) => (
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
                      : 'cursor-grab bg-white/55 text-stone-700 hover:bg-white dark:bg-white/10 dark:text-white/78 dark:hover:bg-white/14'
                }`}
              >
                {renderQuestionText({
                  as: 'span',
                  blockId: getQuestionAnnotationBlockId(
                    annotationBlockIdPrefix,
                    'word-bank-word',
                    wordIndex
                  ),
                  renderAnnotatedTextBlock,
                  text: word,
                })}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <PaperPanel
        title={summaryTitle ?? 'Summary'}
        titleContent={renderQuestionText({
          as: 'span',
          blockId: getQuestionAnnotationBlockId(annotationBlockIdPrefix, 'title'),
          renderAnnotatedTextBlock,
          text: summaryTitle ?? 'Summary',
        })}
      >
        <div className="divide-y divide-[#dfdfdf]">
          {paragraphs.map((paragraph, paragraphIndex) => (
            <section key={`${paragraph.heading ?? 'summary'}-${paragraphIndex}`}>
              {paragraph.heading ? (
                <div className="border-b border-[#dfdfdf] px-5 py-4 dark:border-white/10 sm:px-8">
                  {renderQuestionText({
                    as: 'p',
                    blockId: getQuestionAnnotationBlockId(
                      annotationBlockIdPrefix,
                      'paragraph',
                      paragraphIndex,
                      'heading'
                    ),
                    className: 'font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-white/42',
                    renderAnnotatedTextBlock,
                    style: getPracticeTextStyle(textSize, 'eyebrow'),
                    text: paragraph.heading,
                  })}
                </div>
              ) : null}

              <div className="px-5 py-4 sm:px-8 sm:py-5">
                <p
                  style={getPracticeTextStyle(textSize, 'body')}
                  className="text-stone-800 dark:text-white/84"
                >
                  {paragraph.segments.map((segment, segmentIndex) =>
                    segment.type === 'text' ? (
                      <span key={`text-${paragraphIndex}-${segmentIndex}`}>
                        {renderQuestionText({
                          as: 'span',
                          blockId: getQuestionAnnotationBlockId(
                            annotationBlockIdPrefix,
                            'paragraph',
                            paragraphIndex,
                            'segment',
                            segmentIndex
                          ),
                          renderAnnotatedTextBlock,
                          text: segment.content,
                        })}
                      </span>
                    ) : (
                      <SummaryBlank
                        key={segment.field.id}
                        activeQuestionId={activeQuestionId}
                        answers={answers}
                        annotationBlockIdPrefix={annotationBlockIdPrefix}
                        dragging={dragging}
                        field={segment.field}
                        hasWordBank={hasWordBank}
                        onChange={onChange}
                        onDrop={handleDrop}
                        renderAnnotatedTextBlock={renderAnnotatedTextBlock}
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
  annotationBlockIdPrefix?: string;
  dragging: string | null;
  field: BlankField;
  hasWordBank: boolean;
  onChange: (id: string, value: string) => void;
  onDrop: (fieldId: string, word: string) => void;
  renderAnnotatedTextBlock?: QuestionTypeAnnotationProps['renderAnnotatedTextBlock'];
  showAnswer?: boolean;
};

function SummaryBlank({
  activeQuestionId,
  answers,
  annotationBlockIdPrefix,
  dragging,
  field,
  hasWordBank,
  onChange,
  onDrop,
  renderAnnotatedTextBlock,
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
          annotationBlockIdPrefix={annotationBlockIdPrefix}
          field={{ ...field, label: '' }}
          value={value}
          onChange={onChange}
          renderAnnotatedTextBlock={renderAnnotatedTextBlock}
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
      'inline-flex min-h-10 min-w-[10rem] items-center justify-between rounded-sm border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-900 align-baseline dark:border-white/10 dark:bg-white/8 dark:text-white';
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
        {!showAnswer && value ? <span className="ml-2 text-stone-400 dark:text-white/34">✕</span> : null}
      </button>

      {showAnswer && !isCorrect ? (
        <span className="text-sm font-medium text-green-700">✓ {primaryAnswer}</span>
      ) : null}
    </span>
  );
}
