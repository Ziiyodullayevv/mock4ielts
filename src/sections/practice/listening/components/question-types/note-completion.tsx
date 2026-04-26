'use client';

import type { NoteSection } from '../../types';
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
  noteTitle?: string;
  sections: NoteSection[];
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function NoteCompletion({
  activeQuestionId,
  annotationBlockIdPrefix,
  noteTitle,
  sections,
  answers,
  onChange,
  renderAnnotatedTextBlock,
  showAnswer,
}: Props) {
  const textSize = usePracticeTextSize();

  return (
    <PaperPanel
      title={noteTitle ?? 'Notes'}
      titleContent={renderQuestionText({
        as: 'span',
        blockId: getQuestionAnnotationBlockId(annotationBlockIdPrefix, 'title'),
        renderAnnotatedTextBlock,
        text: noteTitle ?? 'Notes',
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

            <ul className={PAPER_DIVIDER_CLASS_NAME}>
              {section.bullets.map((bullet, bulletIndex) => (
                <li
                  key={bulletIndex}
                  id={bullet.field ? getListeningQuestionAnchorId(bullet.field.id) : undefined}
                  className={`${PAPER_ROW_CLASS_NAME} scroll-mt-28 !py-4`}
                >
                  <div
                    style={getPracticeTextStyle(textSize, 'body')}
                    className="flex flex-wrap items-center gap-1 text-stone-800 dark:text-white/84"
                  >
                    {renderQuestionText({
                      as: 'span',
                      blockId: getQuestionAnnotationBlockId(
                        annotationBlockIdPrefix,
                        'section',
                        sectionIndex,
                        'bullet',
                        bulletIndex,
                        'text'
                      ),
                      renderAnnotatedTextBlock,
                      text: bullet.text,
                    })}
                    {bullet.field ? (
                      <>
                        <QuestionNumberBadge
                          isActive={bullet.field.id === activeQuestionId}
                          number={bullet.field.number}
                          size="xs"
                        />
                        <CompletionInput
                          annotationBlockIdPrefix={annotationBlockIdPrefix}
                          field={bullet.field}
                          value={answers[bullet.field.id] ?? ''}
                          onChange={onChange}
                          renderAnnotatedTextBlock={renderAnnotatedTextBlock}
                          showAnswer={showAnswer}
                        />
                      </>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PaperPanel>
  );
}
