'use client';

import type { NoteSection } from '../../types';

import { CompletionInput } from './completion-input';
import { getListeningQuestionAnchorId } from '../../utils';
import { PaperPanel, PAPER_ROW_CLASS_NAME } from './paper-shell';

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
      <div className="divide-y divide-white/65">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.heading ? (
              <div className="border-b border-white/65 px-8 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                  {section.heading}
                </p>
              </div>
            ) : null}

            <ul className="divide-y divide-white/65">
              {section.bullets.map((bullet, bulletIndex) => (
                <li
                  key={bulletIndex}
                  id={bullet.field ? getListeningQuestionAnchorId(bullet.field.id) : undefined}
                  className={`${PAPER_ROW_CLASS_NAME} scroll-mt-28 flex items-start gap-3`}
                >
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-500" />
                  <div className="flex flex-wrap items-center gap-1.5 text-[1.05rem] leading-9 text-stone-800">
                    <span>{bullet.text}</span>
                    {bullet.field ? (
                      <>
                        <span
                          className={`font-semibold ${
                            bullet.field.id === activeQuestionId ? 'text-blue-600' : 'text-stone-800'
                          }`}
                        >
                          ({bullet.field.number})
                        </span>
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
