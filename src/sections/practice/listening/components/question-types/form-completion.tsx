'use client';

import type { FormSection } from '../../types';

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
