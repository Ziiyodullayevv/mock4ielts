'use client';

import type { BlankField } from '../../types';

import { CompletionInput } from './completion-input';
import { getListeningQuestionAnchorId } from '../../utils';
import { PaperPanel, PAPER_ROW_CLASS_NAME } from './paper-shell';

interface Props {
  activeQuestionId?: string | null;
  questions: BlankField[];
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function ShortAnswer({
  activeQuestionId,
  questions,
  answers,
  onChange,
  showAnswer,
}: Props) {
  return (
    <PaperPanel>
      <div className="divide-y divide-white/65">
        {questions.map((q) => (
          <div
            key={q.id}
            id={getListeningQuestionAnchorId(q.id)}
            className={`${PAPER_ROW_CLASS_NAME} scroll-mt-28 space-y-3`}
          >
            <p className="text-[1.05rem] leading-9 text-stone-800">
              <span
                className={`mr-2 font-semibold ${
                  q.id === activeQuestionId ? 'text-blue-600' : 'text-stone-800'
                }`}
              >
                {q.number})
              </span>
              {q.label}
            </p>
            <CompletionInput
              field={{ ...q, label: '' }}
              value={answers[q.id] ?? ''}
              onChange={onChange}
              showAnswer={showAnswer}
            />
          </div>
        ))}
      </div>
    </PaperPanel>
  );
}
