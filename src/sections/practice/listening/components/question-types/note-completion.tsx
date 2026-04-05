'use client';

import type { NoteSection } from '../../types';

import { CompletionInput } from './completion-input';
import { getListeningQuestionAnchorId } from '../../utils';
import {
  PaperPanel,
  QuestionNumberBadge,
  PAPER_ROW_CLASS_NAME,
  PAPER_DIVIDER_CLASS_NAME,
} from './paper-shell';

interface Props {
  activeQuestionId?: string | null;
  noteTitle?: string;
  sections: NoteSection[];
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function NoteCompletion({
  activeQuestionId,
  noteTitle,
  sections,
  answers,
  onChange,
  showAnswer,
}: Props) {
  return (
    <PaperPanel title={noteTitle ?? 'Notes'}>
      <div className={PAPER_DIVIDER_CLASS_NAME}>
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.heading ? (
              <div className="border-b border-[#dfdfdf] px-5 py-4 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                  {section.heading}
                </p>
              </div>
            ) : null}

            <ul className={PAPER_DIVIDER_CLASS_NAME}>
              {section.bullets.map((bullet, bulletIndex) => (
                <li
                  key={bulletIndex}
                  id={bullet.field ? getListeningQuestionAnchorId(bullet.field.id) : undefined}
                  className={`${PAPER_ROW_CLASS_NAME} scroll-mt-28 !py-4`}
                >
                  <div className="flex flex-wrap items-center gap-1 text-[1.05rem] leading-8 text-stone-800">
                    <span>{bullet.text}</span>
                    {bullet.field ? (
                      <>
                        <QuestionNumberBadge
                          isActive={bullet.field.id === activeQuestionId}
                          number={bullet.field.number}
                          size="xs"
                        />
                        <CompletionInput
                          field={bullet.field}
                          value={answers[bullet.field.id] ?? ''}
                          onChange={onChange}
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
