'use client';

import type { FormSection } from '../../types';
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
  formTitle: string;
  sections: FormSection[];
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function FormCompletion({
  activeQuestionId,
  annotationBlockIdPrefix,
  formTitle,
  sections,
  answers,
  onChange,
  renderAnnotatedTextBlock,
  showAnswer,
}: Props) {
  const textSize = usePracticeTextSize();

  return (
    <PaperPanel
      title={formTitle}
      titleContent={renderQuestionText({
        as: 'span',
        blockId: getQuestionAnnotationBlockId(annotationBlockIdPrefix, 'title'),
        renderAnnotatedTextBlock,
        text: formTitle,
      })}
    >
      <div className={PAPER_DIVIDER_CLASS_NAME}>
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.heading ? (
              <div className="border-b border-[#dfdfdf] px-5 py-4 dark:border-white/10 sm:px-8">
                {renderQuestionText({
                  as: 'p',
                  blockId: getQuestionAnnotationBlockId(
                    annotationBlockIdPrefix,
                    'section',
                    sectionIndex,
                    'heading'
                  ),
                  className: 'font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-white/42',
                  renderAnnotatedTextBlock,
                  style: getPracticeTextStyle(textSize, 'eyebrow'),
                  text: section.heading,
                })}
              </div>
            ) : null}

            <div className={PAPER_DIVIDER_CLASS_NAME}>
              {section.fields.map((field) => (
                <div
                  key={field.id}
                  id={getListeningQuestionAnchorId(field.id)}
                  className={`${PAPER_ROW_CLASS_NAME} scroll-mt-28 flex flex-wrap items-center gap-2.5 !py-4`}
                >
                  <QuestionNumberBadge
                    isActive={field.id === activeQuestionId}
                    number={field.number}
                    size="sm"
                  />
                  <CompletionInput
                    annotationBlockIdPrefix={annotationBlockIdPrefix}
                    field={field}
                    value={answers[field.id] ?? ''}
                    onChange={onChange}
                    renderAnnotatedTextBlock={renderAnnotatedTextBlock}
                    showAnswer={showAnswer}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PaperPanel>
  );
}
