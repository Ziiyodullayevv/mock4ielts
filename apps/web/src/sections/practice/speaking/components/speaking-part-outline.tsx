import type { SpeakingPart } from '../types';

import { cn } from '@/src/lib/utils';
import { PRACTICE_FOOTER_CARD_RING_CLASS } from '@/src/layouts/practice-surface-theme';

type SpeakingPartOutlineProps = {
  anchorId?: string;
  isActive?: boolean;
  part: SpeakingPart;
};

export function SpeakingPartOutline({
  anchorId,
  isActive = false,
  part,
}: SpeakingPartOutlineProps) {
  return (
    <article
      id={anchorId}
      className={cn(
        'scroll-mt-28 rounded-[24px] p-4 shadow-[0_4px_24px_rgba(15,23,42,0.05)] transition-shadow sm:p-5',
        PRACTICE_FOOTER_CARD_RING_CLASS,
        isActive && 'shadow-[0_22px_55px_rgba(20,145,116,0.10)]'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#149174]">
            {part.partKey}
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-stone-950">
            {part.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-600">
            {part.questions.length} prompts
          </span>
          <span className="rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-600">
            {part.durationMinutes} min
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-stone-600">{part.instructions}</p>

      <div className="mt-4 space-y-3">
        {part.questions.map((question) => (
          <div
            key={question.id}
            className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-stone-900 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                Q{question.number}
              </span>
              <span className="text-xs text-stone-500">{question.questionType}</span>
              {question.metadata.topic ? (
                <span className="text-xs text-stone-500">{question.metadata.topic}</span>
              ) : null}
            </div>

            <p className="mt-2 text-sm leading-6 text-stone-900">{question.text}</p>

            {question.metadata.bulletPoints.length ? (
              <ul className="mt-2 space-y-1 text-sm leading-6 text-stone-600">
                {question.metadata.bulletPoints.map((point) => (
                  <li key={point}>- {point}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </article>
  );
}
