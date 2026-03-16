'use client';

import type { MatchingData } from '../../types';

import { useState } from 'react';

import { useDragAutoScroll } from './use-drag-auto-scroll';
import { getListeningQuestionAnchorId } from '../../utils';
import { PaperPanel, PAPER_ROW_CLASS_NAME, PAPER_PANEL_CLASS_NAME } from './paper-shell';

interface Props {
  activeQuestionId?: string | null;
  data: MatchingData;
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function Matching({
  activeQuestionId,
  data,
  answers,
  onChange,
  showAnswer,
}: Props) {
  const [dragging, setDragging] = useState<string | null>(null);

  useDragAutoScroll(Boolean(dragging) && !showAnswer);

  const handleDrop = (pairId: string, optionValue: string) => {
    // If this pair already had an answer, free it first
    const existing = answers[pairId];
    if (existing) onChange(pairId, '');
    onChange(pairId, optionValue);
    setDragging(null);
  };

  const handleRemove = (pairId: string) => {
    if (!showAnswer) onChange(pairId, '');
  };

  return (
    <div className="space-y-6">
      <section className={PAPER_PANEL_CLASS_NAME}>
        <div className="flex flex-wrap gap-3 p-4 md:p-5">
          {data.options.map((opt) => {
            const [value, ...labelParts] = opt.label.split(/\s+/);

            return (
              <div
                key={opt.value}
                draggable={!showAnswer}
                onDragStart={() => setDragging(opt.value)}
                onDragEnd={() => setDragging(null)}
                className={`flex min-h-24 w-full items-start gap-4 bg-white/55 px-5 py-4 text-[1.02rem] leading-7 text-stone-800 md:w-[calc(50%-0.375rem)] xl:w-[calc(33.333%-0.5rem)] ${
                  showAnswer ? '' : 'cursor-grab select-none'
                }`}
              >
                <span className="w-10 shrink-0 text-[1.8rem] font-semibold leading-none tracking-[-0.04em] text-stone-900">
                  {value}
                </span>
                <span className="min-w-0 text-balance">{labelParts.join(' ')}</span>
              </div>
            );
          })}
        </div>
      </section>

      <PaperPanel title="Questions" titleClassName="text-[#ef233c]">
        <div className="divide-y divide-white/65">
          {data.pairs.map((pair) => {
            const val = answers[pair.id] ?? '';
            const isActiveQuestion = pair.id === activeQuestionId;
            const isCorrect = showAnswer ? val === pair.answer : undefined;
            const optionLabel = data.options.find((o) => o.value === val)?.label ?? '';
            const correctLabel = data.options.find((o) => o.value === pair.answer)?.label ?? '';

            return (
              <div
                key={pair.id}
                id={getListeningQuestionAnchorId(pair.id)}
                className={`${PAPER_ROW_CLASS_NAME} scroll-mt-28 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between`}
              >
                <div className="max-w-3xl text-[1.05rem] leading-9 text-stone-800">
                  <span
                    className={`mr-2 font-semibold ${
                      isActiveQuestion ? 'text-blue-600' : 'text-stone-900'
                    }`}
                  >
                    {pair.number})
                  </span>
                  {pair.text}
                </div>

                <div className="w-full max-w-sm space-y-2">
                  <div
                    data-question-focus={!showAnswer ? 'true' : undefined}
                    tabIndex={showAnswer ? -1 : 0}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => dragging && handleDrop(pair.id, dragging)}
                    className={`min-h-12 px-4 py-3 text-sm transition-colors ${
                      showAnswer
                        ? isCorrect
                          ? 'bg-green-50 text-green-800'
                          : 'bg-red-50 text-red-700'
                        : val
                          ? 'bg-white text-stone-900'
                          : 'bg-white/55 text-stone-500'
                    }`}
                  >
                    {val ? (
                      <div className="flex items-center justify-between gap-3">
                        <span>{optionLabel}</span>
                        {!showAnswer ? (
                          <button
                            type="button"
                            onClick={() => handleRemove(pair.id)}
                            className="text-stone-400 transition-colors hover:text-red-500"
                          >
                            ✕
                          </button>
                        ) : null}
                      </div>
                    ) : (
                      <span>Drag the correct letter here</span>
                    )}
                  </div>

                  {showAnswer && !isCorrect ? (
                    <p className="text-sm font-medium text-green-700">✓ {correctLabel}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </PaperPanel>
    </div>
  );
}
