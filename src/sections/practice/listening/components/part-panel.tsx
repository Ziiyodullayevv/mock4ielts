'use client';

import type { Part } from '../types';

import { QuestionGroupRenderer } from './question-types/index';

interface Props {
  activeQuestionId?: string | null;
  part: Part;
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function PartPanel({ activeQuestionId, part, answers, onChange, showAnswer }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2.5 border-b border-stone-200 pb-4">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-stone-800 md:text-[1.7rem]">
          {part.title}
        </h2>
        <p className="max-w-5xl text-base leading-7 text-stone-600">{part.scenario}</p>
      </div>

      <div className="space-y-8">
        {part.groups.map((group, gi) => (
          <div key={gi} className="space-y-4">
            <QuestionGroupRenderer
              activeQuestionId={activeQuestionId}
              group={group}
              answers={answers}
              onChange={onChange}
              showAnswer={showAnswer}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
