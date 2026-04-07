'use client';

import type { Answers, ReadingPart } from '../types';

import { cn } from '@/src/lib/utils';
import { useRef, useState, useCallback } from 'react';
import { QuestionGroupRenderer } from '@/src/sections/practice/listening/components/question-types';
import { PaperSurface } from '@/src/sections/practice/listening/components/question-types/paper-shell';

type ReadingPartPanelProps = {
  activeQuestionId?: string | null;
  answers: Answers;
  onChange: (id: string, value: string) => void;
  part: ReadingPart;
  showAnswer?: boolean;
};

const MIN_PANEL_PERCENT = 20;
const DEFAULT_SPLIT_PERCENT = 50;

type MobileTab = 'passage' | 'questions';

function getPassageParagraphs(passageText: string) {
  return passageText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function PassageContent({ part }: { part: ReadingPart }) {
  const paragraphs = getPassageParagraphs(part.passageText);

  return (
    <div className="space-y-5">
      {paragraphs.length ? (
        paragraphs.map((paragraph, index) => (
          <p
            key={`${part.number}-paragraph-${index}`}
            className={cn(
              'text-[1.02rem] leading-8 text-stone-800',
              paragraph.match(/^[A-Z]\s+/) ? 'font-medium' : ''
            )}
          >
            {paragraph}
          </p>
        ))
      ) : (
        <p className="text-[1.02rem] leading-8 text-stone-800">{part.passageText}</p>
      )}
    </div>
  );
}

export function ReadingPartPanel({
  activeQuestionId,
  answers,
  onChange,
  part,
  showAnswer,
}: ReadingPartPanelProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>('passage');

  const containerRef = useRef<HTMLDivElement>(null);
  const [splitPercent, setSplitPercent] = useState(DEFAULT_SPLIT_PERCENT);
  const [isDragging, setIsDragging] = useState(false);

  const handleResizerMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setIsDragging(true);

    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const rawPercent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(100 - MIN_PANEL_PERCENT, Math.max(MIN_PANEL_PERCENT, rawPercent));
      setSplitPercent(clamped);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  const questionsContent = (
    <div className="space-y-6">
      <div className="space-y-2.5 border-b border-stone-200 pb-4">
        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-stone-800 md:text-[1.7rem]">
          {part.title}
        </h3>
        <p className="max-w-5xl text-base leading-7 text-stone-600">{part.scenario}</p>
      </div>

      <div className="space-y-8">
        {part.groups.map((group, groupIndex) => (
          <div key={`${part.number}-${group.type}-${groupIndex}`} className="space-y-4">
            <QuestionGroupRenderer
              activeQuestionId={activeQuestionId}
              answers={answers}
              group={group}
              onChange={onChange}
              showAnswer={showAnswer}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile / tablet: tab switcher ── */}
      <div className="flex flex-col gap-0 lg:hidden">
        {/* Tab bar */}
        <div className="sticky top-14 z-10 flex border-b border-stone-200 bg-white">
          <button
            type="button"
            onClick={() => setMobileTab('passage')}
            className={cn(
              'flex flex-1 items-center justify-center px-4 py-3 text-sm font-medium transition-colors',
              mobileTab === 'passage'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-stone-500 hover:text-stone-700'
            )}
          >
            Passage
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('questions')}
            className={cn(
              'flex flex-1 items-center justify-center px-4 py-3 text-sm font-medium transition-colors',
              mobileTab === 'questions'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-stone-500 hover:text-stone-700'
            )}
          >
            Questions
          </button>
        </div>

        {/* Tab content */}
        <div className="pt-4">
          {mobileTab === 'passage' ? (
            <PaperSurface className="overflow-hidden">
              <div className="border-b border-[#dfdfdf] px-5 py-4 sm:px-6">
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    {part.title}
                  </p>
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-stone-900">
                    Reading passage
                  </h2>
                  <p className="text-sm leading-7 text-stone-600">{part.scenario}</p>
                </div>
              </div>
              <article className="px-5 py-5 sm:px-6">
                <PassageContent part={part} />
              </article>
            </PaperSurface>
          ) : (
            questionsContent
          )}
        </div>
      </div>

      {/* ── Desktop (xl+): side-by-side with draggable resizer ── */}
      <div
        ref={containerRef}
        className={cn('relative hidden lg:flex lg:items-start', isDragging && 'select-none')}
      >
        {/* Full-height divider line — absolutely positioned in the container so it never
            overflows at the bottom. Extends upward behind the sticky header via negative top. */}
        <div
          className={cn(
            'pointer-events-none absolute bottom-0 w-0.5 -translate-x-1/2 transition-colors duration-150',
            isDragging ? 'bg-blue-400/70' : 'bg-stone-200'
          )}
          style={{
            left: `${splitPercent}%`,
            top: '-6rem',
          }}
        />

        {/* Left: sticky passage panel — subtract half of resizer width so the
            resizer's centre lands exactly on splitPercent% of the container */}
        <div
          className="sticky top-28 shrink-0"
          style={{ width: `calc(${splitPercent}% - 10px)` }}
        >
          <PaperSurface className="overflow-hidden">
            <div className="border-b border-[#dfdfdf] px-5 py-4 sm:px-6">
              <div className="space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  {part.title}
                </p>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-stone-900">
                  Reading passage
                </h2>
                <p className="text-sm leading-7 text-stone-600">{part.scenario}</p>
              </div>
            </div>
            <article className="max-h-[calc(100vh-11rem)] overflow-y-auto px-5 py-5 sm:px-6">
              <PassageContent part={part} />
            </article>
          </PaperSurface>
        </div>

        {/* Resizer handle — sticky, only the grip pill (line is handled above) */}
        <div
          role="separator"
          aria-label="Drag to resize panels"
          aria-orientation="vertical"
          onMouseDown={handleResizerMouseDown}
          className="group sticky top-[calc(50vh-22px)] w-5 shrink-0 cursor-col-resize flex items-center justify-center"
        >
          <div
            className={cn(
              'relative z-10 flex flex-col items-center gap-0.75 rounded-full border bg-white px-0.75 py-2 shadow-sm transition-all duration-150',
              isDragging
                ? 'border-blue-300 shadow-blue-100'
                : 'border-stone-200 group-hover:border-stone-300 group-hover:shadow-md'
            )}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-0.75 w-0.75 rounded-full transition-colors',
                  isDragging ? 'bg-blue-500' : 'bg-stone-400 group-hover:bg-stone-600'
                )}
              />
            ))}
          </div>
        </div>

        {/* Right: questions (scrolls with page) */}
        <div className="min-w-0 flex-1">
          {questionsContent}
        </div>
      </div>
    </>
  );
}
