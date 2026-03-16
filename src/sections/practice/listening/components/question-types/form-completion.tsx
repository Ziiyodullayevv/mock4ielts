'use client';

import type { FormSection } from '../../types';

import { CompletionInput } from './completion-input';
import { getListeningQuestionAnchorId } from '../../utils';
import { PaperPanel, PAPER_ROW_CLASS_NAME } from './paper-shell';

interface Props {
  activeQuestionId?: string | null;
  formTitle: string;
  sections: FormSection[];
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function FormCompletion({
  activeQuestionId,
  formTitle,
  sections,
  answers,
  onChange,
  showAnswer,
}: Props) {
  return (
    <PaperPanel title={formTitle}>
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

            <div className="divide-y divide-white/65">
              {section.fields.map((field) => (
                <div
                  key={field.id}
                  id={getListeningQuestionAnchorId(field.id)}
                  className={`${PAPER_ROW_CLASS_NAME} scroll-mt-28 flex flex-wrap items-center gap-3`}
                >
                  <span
                    className={`w-10 shrink-0 text-[1.05rem] font-semibold ${
                      field.id === activeQuestionId ? 'text-blue-600' : 'text-stone-800'
                    }`}
                  >
                    ({field.number})
                  </span>
                  <CompletionInput
                    field={field}
                    value={answers[field.id] ?? ''}
                    onChange={onChange}
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
