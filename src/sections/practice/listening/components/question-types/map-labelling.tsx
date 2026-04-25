'use client';

import type { MapData } from '../../types';
import type { QuestionTypeAnnotationProps } from './annotation-blocks';

import { useState } from 'react';

import { PaperPanel, PaperSurface } from './paper-shell';
import { useDragAutoScroll } from './use-drag-auto-scroll';
import { renderQuestionText, getQuestionAnnotationBlockId } from './annotation-blocks';
import { isAnswerCorrect, getPrimaryAnswer, getListeningQuestionAnchorId } from '../../utils';

interface Props extends QuestionTypeAnnotationProps {
  activeQuestionId?: string | null;
  data: MapData;
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
  showAnswer?: boolean;
}

export function MapLabelling({
  activeQuestionId,
  annotationBlockIdPrefix,
  data,
  answers,
  onChange,
  renderAnnotatedTextBlock,
  showAnswer,
}: Props) {
  const [dragging, setDragging] = useState<string | null>(null);
  const hasWordBank = data.wordBank.length > 0;
  const hasImage = Boolean(data.imageUrl);
  const hasLegendOptions = Boolean(data.legendOptions?.length);
  const showBadges = data.showBadges ?? true;
  const canDragFromLegend = hasLegendOptions && hasWordBank && !showAnswer;

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

  const legendPanel = hasLegendOptions ? (
    <PaperSurface className="p-4 sm:p-5">
      {renderQuestionText({
        as: 'p',
        blockId: getQuestionAnnotationBlockId(annotationBlockIdPrefix, 'legend-title'),
        className: 'mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500',
        renderAnnotatedTextBlock,
        text: 'Location key',
      })}
      <div className="flex flex-wrap gap-3">
        {data.legendOptions!.map((option) => (
          <button
            key={option.value}
            type="button"
            draggable={canDragFromLegend && !usedWords.includes(option.value)}
            onDragStart={() => setDragging(option.value)}
            onDragEnd={() => setDragging(null)}
            disabled={!canDragFromLegend || usedWords.includes(option.value)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm leading-6 transition-all ${
              usedWords.includes(option.value)
                ? 'cursor-not-allowed bg-white/60 text-stone-400 opacity-45'
                : canDragFromLegend
                  ? dragging === option.value
                    ? 'cursor-grabbing bg-stone-900 text-white opacity-60'
                    : 'cursor-grab bg-white text-stone-700'
                  : 'bg-white text-stone-700'
            }`}
          >
            <span className={`font-semibold ${usedWords.includes(option.value) ? 'text-inherit' : ''}`}>
              {option.value}
            </span>
            <span className="whitespace-nowrap">
              {renderQuestionText({
                as: 'span',
                blockId: getQuestionAnnotationBlockId(
                  annotationBlockIdPrefix,
                  'legend-option',
                  option.value
                ),
                renderAnnotatedTextBlock,
                text: option.text,
              })}
            </span>
          </button>
        ))}
      </div>
    </PaperSurface>
  ) : null;

  const mapPanel = (
    <PaperPanel
      title={data.panelTitle === undefined ? 'Map' : data.panelTitle ?? undefined}
      titleContent={
        data.panelTitle === null
          ? undefined
          : renderQuestionText({
              as: 'span',
              blockId: getQuestionAnnotationBlockId(annotationBlockIdPrefix, 'title'),
              renderAnnotatedTextBlock,
              text: data.panelTitle === undefined ? 'Map' : data.panelTitle,
            })
      }
    >
      <div className="relative w-full overflow-hidden bg-[#f7f7f7]">
        {hasImage ? (
          <img
            src={data.imageUrl}
            alt={data.panelTitle ?? 'Map question'}
            className="block h-auto w-full"
          />
        ) : (
          <svg
            className="block h-auto w-full"
            viewBox="0 0 400 225"
            xmlns="http://www.w3.org/2000/svg"
          >
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
        )}
        {data.pins.map((pin) => {
          const word = answers[pin.id] ?? '';
          const isActiveQuestion = pin.id === activeQuestionId;
          const inputWidth = Math.max(76, pin.answerLength * 9 + 18);
          const isCorrect = showAnswer ? isAnswerCorrect(word, pin.answer) : undefined;
          const primaryAnswer = getPrimaryAnswer(pin.answer);
          const shouldShowBadge = showBadges && !pin.hideBadge;
          let pinBadgeClassName = 'border-stone-500 bg-stone-500';
          let answerClassName = `${
            shouldShowBadge ? 'mt-1 ' : ''
          }rounded-sm border border-stone-300 bg-[#f7f7f7] px-2.5 py-1 text-xs font-medium whitespace-nowrap text-stone-800`;
          let emptyDropZoneClassName = `${
            shouldShowBadge ? 'mt-1 ' : ''
          }inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border border-dashed border-sky-400 bg-transparent px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-sky-800 whitespace-nowrap shadow-[inset_0_0_0_1px_rgba(125,211,252,0.45)]`;

          if (showAnswer) {
            pinBadgeClassName = isCorrect
              ? 'border-green-600 bg-green-600'
              : 'border-red-500 bg-red-500';
            answerClassName = isCorrect
              ? `${shouldShowBadge ? 'mt-1 ' : ''}rounded-sm border border-green-300 bg-green-50 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-green-700`
              : `${shouldShowBadge ? 'mt-1 ' : ''}rounded-sm border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-red-600`;
          } else if (isActiveQuestion) {
            pinBadgeClassName = 'border-sky-500 bg-sky-500 ring-2 ring-sky-200';
            answerClassName =
              `${shouldShowBadge ? 'mt-1 ' : ''}rounded-sm border border-sky-400 bg-sky-50 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-sky-700 shadow-[0_0_0_1px_rgba(56,189,248,0.12)]`;
            emptyDropZoneClassName =
              `${shouldShowBadge ? 'mt-1 ' : ''}inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border border-dashed border-sky-500 bg-transparent px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-sky-900 whitespace-nowrap shadow-[0_0_0_1px_rgba(56,189,248,0.16)]`;
          } else if (word) {
            pinBadgeClassName = 'border-stone-900 bg-stone-900';
          }

          if (!showAnswer && dragging && !word) {
            emptyDropZoneClassName =
              `${shouldShowBadge ? 'mt-1 ' : ''}inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-sky-600 bg-transparent px-3 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-sky-950 whitespace-nowrap shadow-[0_0_0_4px_rgba(56,189,248,0.14)]`;
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
                  className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border text-[0.92rem] font-semibold tabular-nums text-white ${pinBadgeClassName}`}
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
                    {shouldShowBadge ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-current opacity-70" />
                        <span>DROP HERE</span>
                      </span>
                    ) : (
                      ''
                    )}
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
                  ✓ {primaryAnswer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PaperPanel>
  );

  return (
    <div className={hasLegendOptions ? 'grid gap-5 xl:grid-cols-[minmax(0,40fr)_minmax(0,60fr)] xl:items-start' : 'space-y-5'}>
      {legendPanel}

      <div className="min-w-0 space-y-5">
        {hasWordBank && !showAnswer && !hasLegendOptions && (
          <PaperSurface className="p-4 sm:p-5">
          {renderQuestionText({
            as: 'p',
            blockId: getQuestionAnnotationBlockId(annotationBlockIdPrefix, 'word-bank-inline-title'),
            className: 'mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500',
            renderAnnotatedTextBlock,
            text: 'Word bank — drag labels onto the map',
          })}
          <div className="flex flex-wrap gap-2">
            {data.wordBank.map((word, wordIndex) => (
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
                {renderQuestionText({
                  as: 'span',
                  blockId: getQuestionAnnotationBlockId(
                    annotationBlockIdPrefix,
                    'word-bank-word',
                    wordIndex
                  ),
                  renderAnnotatedTextBlock,
                  text: word,
                })}
              </button>
            ))}
          </div>
        </PaperSurface>
        )}

        {mapPanel}
      </div>
    </div>
  );
}
