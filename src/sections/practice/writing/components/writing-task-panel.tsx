'use client';

import type { WritingPart, WritingAnswers } from '../types';

import { cn } from '@/src/lib/utils';
import { useRef, useState, useEffect, useCallback } from 'react';
import { PaperSurface } from '@/src/sections/practice/listening/components/question-types/paper-shell';

import { countWords } from '../utils';

type WritingTaskPanelProps = {
  answers: WritingAnswers;
  isReview?: boolean;
  onChange: (taskId: string, value: string) => void;
  part: WritingPart;
};

const MIN_PANEL_PERCENT = 20;
const DEFAULT_SPLIT_PERCENT = 50;

function PromptContent({ part, isReview }: { part: WritingPart; isReview?: boolean }) {
  const { task } = part;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          {task.questionType === 'graph_description' ? 'Graph / Chart Description' : 'Essay'}
        </p>
        <p className="text-sm leading-6 text-stone-500">{task.instructions}</p>
      </div>

      {task.imageUrl ? (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
          <img src={task.imageUrl} alt="Task graphic" className="h-auto w-full object-contain" />
        </div>
      ) : null}

      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <p className="text-[1.02rem] leading-8 text-stone-800 whitespace-pre-line">{task.prompt}</p>
      </div>

      {isReview && task.modelAnswer ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
            Model Answer
          </p>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <p className="text-[0.97rem] leading-8 text-stone-700 whitespace-pre-line">
              {task.modelAnswer}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AutoResizeTextarea({
  disabled,
  onChange,
  placeholder,
  value,
}: {
  disabled?: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={20}
      className={cn(
        'w-full resize-none overflow-hidden rounded-xl border border-stone-200 bg-white px-5 py-4 text-[1.02rem] leading-8 text-stone-800 outline-none transition-colors placeholder:text-stone-400',
        'focus:border-blue-400 focus:ring-2 focus:ring-blue-100',
        disabled && 'cursor-default bg-stone-50 text-stone-600'
      )}
    />
  );
}

type MobileTab = 'prompt' | 'answer';

export function WritingTaskPanel({
  answers,
  isReview = false,
  onChange,
  part,
}: WritingTaskPanelProps) {
  const { task } = part;
  const value = answers[task.id] ?? '';
  const words = countWords(value);
  const meetsMinimum = words >= task.wordLimitMin;

  const [mobileTab, setMobileTab] = useState<MobileTab>('prompt');

  const containerRef = useRef<HTMLDivElement>(null);
  const [splitPercent, setSplitPercent] = useState(DEFAULT_SPLIT_PERCENT);
  const [isDragging, setIsDragging] = useState(false);

  // Reset to prompt tab when part changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileTab('prompt');
  }, [part.number]);

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

  const writePanel = (
    <div className="space-y-3">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-[-0.03em] text-stone-800">Your response</h3>
        {isReview ? (
          <p className="text-sm text-stone-500">Review your submitted essay below.</p>
        ) : (
          <p className="text-sm text-stone-500">
            Write at least{' '}
            <span className="font-semibold text-stone-700">{task.wordLimitMin} words</span>.
            {task.timeRecommendedMinutes
              ? ` Recommended time: ${task.timeRecommendedMinutes} minutes.`
              : ''}
          </p>
        )}
      </div>

      <AutoResizeTextarea
        value={value}
        disabled={isReview}
        onChange={(text) => onChange(task.id, text)}
        placeholder={`Start writing your ${task.questionType === 'essay' ? 'essay' : 'description'} here...`}
      />

      <div className="flex items-center justify-between px-1">
        <span
          className={cn(
            'text-sm font-medium tabular-nums transition-colors',
            words === 0 ? 'text-stone-400' : meetsMinimum ? 'text-emerald-600' : 'text-amber-600'
          )}
        >
          {words} word{words !== 1 ? 's' : ''}
        </span>
        <span className="text-sm text-stone-400">Minimum: {task.wordLimitMin} words</span>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile / tablet: tab switcher ── */}
      <div className="flex flex-col gap-0 lg:hidden">
        {/* Tab bar */}
        <div className="sticky top-11 z-10 flex border-b border-stone-200 bg-white">
          <button
            type="button"
            onClick={() => setMobileTab('prompt')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
              mobileTab === 'prompt'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-stone-500 hover:text-stone-700'
            )}
          >
            <span>Task Prompt</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('answer')}
            className={cn(
              'relative flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
              mobileTab === 'answer'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-stone-500 hover:text-stone-700'
            )}
          >
            <span>Your Response</span>
            {words > 0 ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums leading-none',
                  meetsMinimum ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                )}
              >
                {words}w
              </span>
            ) : null}
          </button>
        </div>

        {/* Tab content */}
        <div className="pt-4">
          {mobileTab === 'prompt' ? (
            <PaperSurface className="overflow-hidden">
              <div className="border-b border-[#dfdfdf] px-5 py-4 sm:px-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    {part.title}
                  </p>
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-stone-900">
                    Task Prompt
                  </h2>
                </div>
              </div>
              <div className="px-5 py-5 sm:px-6">
                <PromptContent part={part} isReview={isReview} />
              </div>
            </PaperSurface>
          ) : (
            writePanel
          )}
        </div>
      </div>

      {/* ── Desktop (xl+): resizable split pane ── */}
      <div
        ref={containerRef}
        className={cn('relative hidden lg:flex lg:items-start', isDragging && 'select-none')}
      >
        {/* Full-height divider line */}
        <div
          className={cn(
            'pointer-events-none absolute bottom-0 w-0.5 -translate-x-1/2 transition-colors duration-150',
            isDragging ? 'bg-blue-400/70' : 'bg-stone-200'
          )}
          style={{ left: `${splitPercent}%`, top: '-6rem' }}
        />

        {/* Left: prompt panel (sticky) */}
        <div className="sticky top-28 shrink-0" style={{ width: `calc(${splitPercent}% - 10px)` }}>
          <PaperSurface className="overflow-hidden">
            <div className="border-b border-[#dfdfdf] px-5 py-4 sm:px-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  {part.title}
                </p>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-stone-900">
                  Task Prompt
                </h2>
              </div>
            </div>
            <div className="max-h-[calc(100vh-11rem)] overflow-y-auto px-5 py-5 sm:px-6">
              <PromptContent part={part} isReview={isReview} />
            </div>
          </PaperSurface>
        </div>

        {/* Resizer grip */}
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

        {/* Right: writing area */}
        <div className="min-w-0 flex-1">{writePanel}</div>
      </div>
    </>
  );
}
