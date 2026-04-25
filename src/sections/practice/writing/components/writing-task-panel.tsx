'use client';

import type { MouseEvent as ReactMouseEvent } from 'react';
import type { TextAnnotation } from './writing-task-panel.shared';
import type { WritingPart, WritingAnswers, WritingTextSize } from '../types';

import { cn } from '@/src/lib/utils';
import { useRef, useState, useEffect, useCallback } from 'react';
import { PaperSurface } from '@/src/sections/practice/listening/components/question-types/paper-shell';

import { countWords } from '../utils';
import { PromptContent } from './writing-task-prompt-content';
import { WritingResponsePanel } from './writing-response-panel';
import { getWritingUITextStyle } from './writing-task-panel.shared';

type WritingTaskPanelProps = {
  answers: WritingAnswers;
  isReview?: boolean;
  onChange: (taskId: string, value: string) => void;
  part: WritingPart;
  textSize: WritingTextSize;
};

type MobileTab = 'prompt' | 'answer';

type WritingPromptPaperProps = {
  annotations: TextAnnotation[];
  contentClassName?: string;
  headingVariant?: 'desktop' | 'mobile';
  isReview?: boolean;
  onAnnotationsChange: (annotations: TextAnnotation[]) => void;
  part: WritingPart;
  textSize: WritingTextSize;
};

const MIN_PANEL_PERCENT = 20;
const DEFAULT_SPLIT_PERCENT = 50;

function WritingPromptPaper({
  annotations,
  contentClassName,
  headingVariant = 'desktop',
  isReview = false,
  onAnnotationsChange,
  part,
  textSize,
}: WritingPromptPaperProps) {
  return (
    <PaperSurface className="overflow-hidden">
      <div className="border-b border-[#dfdfdf] px-5 py-4 dark:border-white/10 sm:px-6">
        <div className="space-y-1">
          <p
            style={getWritingUITextStyle(textSize, 'eyebrow')}
            className="font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-white/45"
          >
            {part.title}
          </p>
          <h2
            style={getWritingUITextStyle(
              textSize,
              headingVariant === 'mobile' ? 'heading-large' : 'heading'
            )}
            className="font-semibold tracking-[-0.03em] text-stone-900 dark:text-white"
          >
            Task Prompt
          </h2>
        </div>
      </div>

      <div className={cn('px-5 py-5 sm:px-6', contentClassName)}>
        <PromptContent
          annotations={annotations}
          isReview={isReview}
          onAnnotationsChange={onAnnotationsChange}
          part={part}
          textSize={textSize}
        />
      </div>
    </PaperSurface>
  );
}

export function WritingTaskPanel({
  answers,
  isReview = false,
  onChange,
  part,
  textSize,
}: WritingTaskPanelProps) {
  const { task } = part;
  const value = answers[task.id] ?? '';
  const words = countWords(value);
  const meetsMinimum = words >= task.wordLimitMin;

  const [mobileTab, setMobileTab] = useState<MobileTab>('prompt');
  const [annotationsByTaskId, setAnnotationsByTaskId] = useState<Record<string, TextAnnotation[]>>(
    {}
  );
  const [splitPercent, setSplitPercent] = useState(DEFAULT_SPLIT_PERCENT);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentAnnotations = annotationsByTaskId[task.id] ?? [];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileTab('prompt');
  }, [part.number]);

  const handleAnnotationsChange = useCallback(
    (nextAnnotations: TextAnnotation[]) => {
      setAnnotationsByTaskId((previousState) => ({
        ...previousState,
        [task.id]: nextAnnotations,
      }));
    },
    [task.id]
  );

  const handleResizerMouseDown = useCallback((event: ReactMouseEvent) => {
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

  return (
    <>
      <div className="flex flex-col gap-0 lg:hidden">
        <div className="sticky top-11 z-10 flex border-b border-stone-200 bg-white dark:border-white/10 dark:bg-background">
          <button
            type="button"
            onClick={() => setMobileTab('prompt')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 px-4 py-3 font-medium transition-colors',
              mobileTab === 'prompt'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-stone-500 hover:text-stone-700 dark:text-white/55 dark:hover:text-white/80'
            )}
          >
            <span style={getWritingUITextStyle(textSize, 'tab')}>Task Prompt</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('answer')}
            className={cn(
              'relative flex flex-1 items-center justify-center gap-2 px-4 py-3 font-medium transition-colors',
              mobileTab === 'answer'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-stone-500 hover:text-stone-700 dark:text-white/55 dark:hover:text-white/80'
            )}
          >
            <span style={getWritingUITextStyle(textSize, 'tab')}>Your Response</span>
            {words > 0 ? (
              <span
                style={getWritingUITextStyle(textSize, 'badge')}
                className={cn(
                  'rounded-full px-1.5 py-0.5 font-semibold tabular-nums leading-none',
                  meetsMinimum
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/18 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/18 dark:text-amber-300'
                )}
              >
                {words}w
              </span>
            ) : null}
          </button>
        </div>

        <div className="pt-4">
          {mobileTab === 'prompt' ? (
            <WritingPromptPaper
              annotations={currentAnnotations}
              headingVariant="mobile"
              isReview={isReview}
              onAnnotationsChange={handleAnnotationsChange}
              part={part}
              textSize={textSize}
            />
          ) : (
            <WritingResponsePanel
              isReview={isReview}
              onChange={(text) => onChange(task.id, text)}
              task={task}
              textSize={textSize}
              value={value}
            />
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className={cn('relative hidden lg:flex lg:items-start', isDragging && 'select-none')}
      >
        <div
          className={cn(
            'pointer-events-none absolute bottom-0 w-0.5 -translate-x-1/2 transition-colors duration-150',
            isDragging
              ? 'bg-[linear-gradient(180deg,#ffb347_0%,#ff9f2f_55%,#ffb347_100%)]'
              : 'bg-stone-200 dark:bg-white/12'
          )}
          style={{ left: `${splitPercent}%`, top: '-6rem' }}
        />

        <div className="sticky top-28 shrink-0" style={{ width: `calc(${splitPercent}% - 10px)` }}>
          <WritingPromptPaper
            annotations={currentAnnotations}
            contentClassName="max-h-[calc(100vh-11rem)] overflow-y-auto"
            isReview={isReview}
            onAnnotationsChange={handleAnnotationsChange}
            part={part}
            textSize={textSize}
          />
        </div>

        <div
          role="separator"
          aria-label="Drag to resize panels"
          aria-orientation="vertical"
          onMouseDown={handleResizerMouseDown}
          className="group sticky top-[calc(50vh-22px)] flex w-5 shrink-0 cursor-col-resize items-center justify-center"
        >
          <div
            className={cn(
              'relative z-10 flex flex-col items-center gap-0.75 rounded-full border bg-white px-0.75 py-2 shadow-sm transition-all duration-150 dark:bg-[#141414] dark:shadow-none',
              isDragging
                ? 'border-[#ffb347] bg-[linear-gradient(135deg,#ffb347_0%,#ff9f2f_52%,#ffb347_100%)] shadow-[0_0_0_1px_rgba(255,179,71,0.24)] dark:shadow-[0_0_0_1px_rgba(255,179,71,0.24)]'
                : 'border-stone-200 group-hover:border-stone-300 group-hover:shadow-md dark:border-white/10 dark:group-hover:border-white/18 dark:group-hover:shadow-none'
            )}
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-0.75 w-0.75 rounded-full transition-colors',
                  isDragging
                    ? 'bg-white/80'
                    : 'bg-stone-400 group-hover:bg-stone-600 dark:bg-white/32 dark:group-hover:bg-white/55'
                )}
              />
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <WritingResponsePanel
            isReview={isReview}
            onChange={(text) => onChange(task.id, text)}
            task={task}
            textSize={textSize}
            value={value}
          />
        </div>
      </div>
    </>
  );
}
