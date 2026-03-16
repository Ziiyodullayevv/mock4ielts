'use client';

import type { MapData } from '../../types';

import { useState } from 'react';

import { PaperPanel } from './paper-shell';
import { useDragAutoScroll } from './use-drag-auto-scroll';
import { getListeningQuestionAnchorId } from '../../utils';

interface Props {
  activeQuestionId?: string | null;
  data: MapData;
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function MapLabelling({ activeQuestionId, data, answers, onChange, showAnswer }: Props) {
  const [dragging, setDragging] = useState<string | null>(null);
  const hasWordBank = data.wordBank.length > 0;
  const showBadges = data.showBadges ?? true;

  useDragAutoScroll(Boolean(dragging) && !showAnswer && hasWordBank);

  const usedWords = data.pins.map((pin) => answers[pin.id]).filter(Boolean);

  const handleDrop = (pinId: string, word: string) => {
    const existing = answers[pinId];

    if (existing) {
      onChange(pinId, '');
    }

    onChange(pinId, word);
    setDragging(null);
  };

  const handleRemove = (pinId: string) => {
    if (!showAnswer) {
      onChange(pinId, '');
    }
  };

  return (
    <div className="space-y-5">
      {hasWordBank && !showAnswer && (
        <div className="bg-[#f5f5f7] p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Word bank — drag labels onto the map
          </p>
          <div className="flex flex-wrap gap-2">
            {data.wordBank.map((word) => (
              <button
                key={word}
                type="button"
                draggable
                onDragStart={() => setDragging(word)}
                onDragEnd={() => setDragging(null)}
                className={`px-4 py-2 text-sm font-medium select-none transition-all ${
                  usedWords.includes(word)
                    ? 'cursor-not-allowed bg-white/25 text-stone-400 opacity-30'
                    : dragging === word
                      ? 'cursor-grabbing bg-stone-900 text-white opacity-50'
                      : 'cursor-grab bg-white/55 text-stone-700 hover:bg-white'
                }`}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      )}

      <PaperPanel title={data.panelTitle === undefined ? 'Map' : data.panelTitle ?? undefined}>
        <div className="relative overflow-hidden bg-[#f5f5f7]" style={{ paddingBottom: '56.25%' }}>
          <div className="absolute inset-0">
            <svg className="h-full w-full" viewBox="0 0 400 225" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="10" width="380" height="205" fill="none" stroke="#8f8f93" strokeWidth="2" />
              <rect x="10" y="10" width="110" height="105" fill="#f4f4f5" stroke="#8f8f93" strokeWidth="1" />
              <text x="65" y="67" textAnchor="middle" fontSize="9" fill="#44403c">
                Zone A
              </text>

              <rect x="120" y="10" width="160" height="105" fill="#f4f4f5" stroke="#8f8f93" strokeWidth="1" />
              <text x="200" y="67" textAnchor="middle" fontSize="9" fill="#44403c">
                Central Hall
              </text>

              <rect x="280" y="10" width="110" height="105" fill="#f4f4f5" stroke="#8f8f93" strokeWidth="1" />
              <text x="335" y="67" textAnchor="middle" fontSize="9" fill="#44403c">
                Zone B
              </text>

              <rect x="10" y="115" width="130" height="100" fill="#f4f4f5" stroke="#8f8f93" strokeWidth="1" />
              <text x="75" y="168" textAnchor="middle" fontSize="9" fill="#44403c">
                South Wing
              </text>

              <rect x="140" y="115" width="120" height="100" fill="#f4f4f5" stroke="#8f8f93" strokeWidth="1" />
              <text x="200" y="168" textAnchor="middle" fontSize="9" fill="#44403c">
                Gallery
              </text>

              <rect x="260" y="115" width="130" height="100" fill="#f4f4f5" stroke="#8f8f93" strokeWidth="1" />
              <text x="325" y="168" textAnchor="middle" fontSize="9" fill="#44403c">
                East Wing
              </text>

              <line x1="185" y1="215" x2="215" y2="215" stroke="#8f8f93" strokeWidth="3" />
              <text x="200" y="224" textAnchor="middle" fontSize="8" fill="#44403c">
                Entrance
              </text>
            </svg>

            {data.pins.map((pin) => {
              const word = answers[pin.id] ?? '';
              const isActiveQuestion = pin.id === activeQuestionId;
              const inputWidth = Math.max(76, pin.answerLength * 9 + 18);
              const isCorrect = showAnswer
                ? word.toLowerCase() === pin.answer.toLowerCase()
                : undefined;
              const shouldShowBadge = showBadges && !pin.hideBadge;
              let pinBadgeClassName = 'border-stone-500 bg-stone-500';
              let answerClassName = `${
                shouldShowBadge ? 'mt-1 ' : ''
              }rounded-sm border border-stone-300 bg-[#f5f5f7] px-2.5 py-1 text-xs font-medium whitespace-nowrap text-stone-800`;
              let emptyDropZoneClassName = `${
                shouldShowBadge ? 'mt-1 ' : ''
              }rounded-sm border border-dashed border-sky-300 bg-sky-50/40 px-2.5 py-1 text-xs text-sky-700 whitespace-nowrap`;

              if (showAnswer) {
                pinBadgeClassName = isCorrect
                  ? 'border-green-600 bg-green-600'
                  : 'border-red-500 bg-red-500';
                answerClassName = isCorrect
                  ? `${shouldShowBadge ? 'mt-1 ' : ''}rounded-sm border border-green-300 bg-green-50 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-green-700`
                  : `${shouldShowBadge ? 'mt-1 ' : ''}rounded-sm border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-red-600`;
              } else if (isActiveQuestion) {
                pinBadgeClassName = word
                  ? 'border-sky-500 bg-sky-500 ring-2 ring-sky-200'
                  : 'border-sky-500 bg-sky-500 ring-2 ring-sky-200';
                answerClassName =
                  `${shouldShowBadge ? 'mt-1 ' : ''}rounded-sm border border-sky-400 bg-sky-50 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-sky-700 shadow-[0_0_0_1px_rgba(56,189,248,0.12)]`;
                emptyDropZoneClassName =
                  `${shouldShowBadge ? 'mt-1 ' : ''}rounded-sm border border-dashed border-sky-400 bg-sky-50 px-2.5 py-1 text-xs text-sky-700 whitespace-nowrap`;
              } else if (word) {
                pinBadgeClassName = 'border-stone-900 bg-stone-900';
              }

              return (
                <div
                  key={pin.id}
                  id={getListeningQuestionAnchorId(pin.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => dragging && handleDrop(pin.id, dragging)}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: 'translate(-50%, -50%)' }}
                  className={`absolute scroll-mt-28 ${shouldShowBadge ? 'flex flex-col items-center' : ''}`}
                >
                  {shouldShowBadge ? (
                    <div
                      className={`z-10 flex h-7 min-w-7 items-center justify-center rounded-xl border px-1.5 text-xs font-bold text-white ${pinBadgeClassName}`}
                    >
                      {pin.number}
                    </div>
                  ) : null}

                  {hasWordBank ? (
                    word ? (
                      <div
                        data-question-focus={!showAnswer ? 'true' : undefined}
                        tabIndex={showAnswer ? -1 : 0}
                        className={answerClassName}
                      >
                        {word}
                        {!showAnswer && (
                          <button
                            type="button"
                            onClick={() => handleRemove(pin.id)}
                            className="ml-1 text-stone-400 hover:text-red-500"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ) : (
                      <div
                        data-question-focus={!showAnswer ? 'true' : undefined}
                        tabIndex={showAnswer ? -1 : 0}
                        className={emptyDropZoneClassName}
                      >
                        {shouldShowBadge ? 'drop here' : ''}
                      </div>
                    )
                  ) : (
                    <div
                      className={`mt-1 rounded-sm border px-2 py-1 ${
                        showAnswer
                          ? isCorrect
                            ? 'border-green-300 bg-green-50'
                            : 'border-red-300 bg-red-50'
                          : isActiveQuestion
                            ? 'border-sky-400 bg-sky-50 shadow-[0_0_0_1px_rgba(56,189,248,0.12)]'
                            : 'border-sky-300 bg-sky-50/40'
                      }`}
                    >
                      <input
                        data-question-focus="true"
                        type="text"
                        name={`listening-answer-${pin.id}`}
                        value={word}
                        onChange={(event) => onChange(pin.id, event.target.value)}
                        disabled={showAnswer}
                        maxLength={pin.answerLength + 6}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        style={{ width: inputWidth }}
                        className={`bg-transparent text-xs font-medium outline-none ${
                          showAnswer
                            ? isCorrect
                              ? 'text-green-700'
                              : 'text-red-600'
                            : 'text-stone-800'
                        }`}
                      />
                    </div>
                  )}

                  {showAnswer && !isCorrect && (
                    <div className="mt-1 whitespace-nowrap text-xs font-medium text-green-700">
                      ✓ {pin.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </PaperPanel>
    </div>
  );
}
