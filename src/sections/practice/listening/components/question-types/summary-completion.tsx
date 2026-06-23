'use client';

import type { QuestionTypeAnnotationProps } from './annotation-blocks';
import type { MCOption, BlankField, SummaryParagraph } from '../../types';

import { Check } from 'lucide-react';
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
} from '@/src/components/ui/select';
import { usePracticeTextSize, getPracticeTextStyle } from '@/src/sections/practice/shared/practice-text-size';

import { CompletionInput } from './completion-input';
import { PaperPanel, QuestionNumberBadge } from './paper-shell';
import { renderQuestionText, getQuestionAnnotationBlockId } from './annotation-blocks';
import { isAnswerCorrect, getPrimaryAnswer, getListeningQuestionAnchorId } from '../../utils';

interface Props extends QuestionTypeAnnotationProps {
  activeQuestionId?: string | null;
  paragraphs: SummaryParagraph[];
  summaryTitle?: string;
  wordBank?: string[];
  wordBankOptions?: MCOption[];
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
  wordBankOptions = [],
  answers,
  onChange,
  renderAnnotatedTextBlock,
  showAnswer,
}: Props) {
  const textSize = usePracticeTextSize();
  const selectOptions = wordBankOptions.length
    ? wordBankOptions.map((option) => ({
        label: `${option.value} ${option.text}`,
        value: option.text,
      }))
    : wordBank.map((word, wordIndex) => ({
        label: `${String.fromCharCode(65 + wordIndex)} ${word}`,
        value: word,
      }));
  const hasWordBank = selectOptions.length > 0;

  return (
    <div className="space-y-5">
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
                <div className="border-b border-[#dfdfdf] px-3 py-2.5 dark:border-white/10 sm:px-4">
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

              <div className="px-3 py-2.5 sm:px-4 sm:py-3">
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
                        field={segment.field}
                        hasWordBank={hasWordBank}
                        onChange={onChange}
                        renderAnnotatedTextBlock={renderAnnotatedTextBlock}
                        showAnswer={showAnswer}
                        selectOptions={selectOptions}
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
  field: BlankField;
  hasWordBank: boolean;
  onChange: (id: string, value: string) => void;
  renderAnnotatedTextBlock?: QuestionTypeAnnotationProps['renderAnnotatedTextBlock'];
  showAnswer?: boolean;
  selectOptions: Array<{ label: string; value: string }>;
};

function SummaryBlank({
  activeQuestionId,
  answers,
  annotationBlockIdPrefix,
  field,
  hasWordBank,
  onChange,
  renderAnnotatedTextBlock,
  showAnswer,
  selectOptions,
}: SummaryBlankProps) {
  const textSize = usePracticeTextSize();
  const value = answers[field.id] ?? '';
  const isActive = field.id === activeQuestionId;
  const isCorrect = showAnswer ? isAnswerCorrect(value, field.answer) : undefined;
  const primaryAnswer = getPrimaryAnswer(field.answer);
  const selectedOption = selectOptions.find((option) => option.value === value);
  const [selectedDisplayValue = '', ...selectedLabelParts] = selectedOption?.label.split(/\s+/) ?? [];
  const selectedLabel = selectedLabelParts.join(' ');

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

  return (
    <span
      id={getListeningQuestionAnchorId(field.id)}
      className="mx-1 inline-flex scroll-mt-28 items-center gap-2 align-baseline"
    >
      <QuestionNumberBadge isActive={isActive} number={field.number} size="xs" />

      {showAnswer ? (
        <span className={blankClassName}>{value || 'NO ANSWER'}</span>
      ) : (
        <Select
          value={value || undefined}
          onValueChange={(nextValue) => onChange(field.id, nextValue === '__clear__' ? '' : nextValue)}
        >
          <SelectTrigger
            data-question-focus="true"
            style={getPracticeTextStyle(textSize, 'body-compact')}
            className={`min-h-11 min-w-[18rem] rounded-xl border px-3 py-2 text-left shadow-none ${
              isActive
                ? 'border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-400/70 dark:bg-sky-500/12 dark:text-sky-100'
                : 'border-stone-300 bg-[#f7f7f7] text-stone-800 dark:border-white/10 dark:bg-white/8 dark:text-white/78'
            }`}
          >
            <div className="flex min-w-0 items-center gap-2">
              {selectedOption ? (
                <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-semibold tracking-[0.08em] text-white dark:bg-white/90 dark:text-stone-950">
                  {selectedDisplayValue}
                </span>
              ) : (
                <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-500/14 text-sky-700 dark:bg-sky-400/20 dark:text-sky-200">
                  <Check className="size-3" strokeWidth={2.6} />
                </span>
              )}
              <span className="truncate">{selectedLabel || 'Select answer'}</span>
            </div>
          </SelectTrigger>
          <SelectContent className="w-[min(34rem,calc(100vw-2rem))] rounded-xl border-stone-300 dark:border-white/10">
            <SelectItem value="__clear__" className="rounded-lg text-stone-500 dark:text-white/52">
              Clear selection
            </SelectItem>
            {selectOptions.map((option) => {
              const [displayValue = '', ...labelParts] = option.label.split(/\s+/);

              return (
                <SelectItem
                  key={`${option.label}-${option.value}`}
                  value={option.value}
                  className="rounded-lg pr-9"
                >
                  <span className="flex min-w-0 items-start gap-2">
                    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-semibold tracking-[0.08em] text-white dark:bg-white/90 dark:text-stone-950">
                      {displayValue}
                    </span>
                    <span className="min-w-0 whitespace-normal break-words leading-6">
                      {labelParts.join(' ') || option.label}
                    </span>
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}

      {showAnswer && !isCorrect ? (
        <span className="text-sm font-medium text-green-700">✓ {primaryAnswer}</span>
      ) : null}
    </span>
  );
}
