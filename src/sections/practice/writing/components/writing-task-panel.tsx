'use client';

import type { MouseEvent as ReactMouseEvent } from 'react';
import type { TextAnnotation } from './writing-task-panel.shared';
import type { WritingPart, WritingAnswers, WritingTextSize } from '../types';

import { cn } from '@/src/lib/utils';
import { useRef, useState, useEffect, useCallback } from 'react';

import { countWords } from '../utils';
import { WritingPanelHeader } from './writing-panel-header';
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
  framed?: boolean;
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
  framed = true,
  isReview = false,
  onAnnotationsChange,
  part,
  textSize,
}: WritingPromptPaperProps) {
  const content = (
    <PromptContent
      annotations={annotations}
      isReview={isReview}
      onAnnotationsChange={onAnnotationsChange}
      part={part}
      textSize={textSize}
    />
  );

  if (!framed) {
    return <div className={cn('py-3', contentClassName)}>{content}</div>;
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-stone-200/80 bg-white dark:border-white/10 dark:bg-[#1f1f1f]">
      <WritingPanelHeader
        description={part.title}
        textSize={textSize}
        title="Task Prompt"
      />

      <div className={cn('min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4', contentClassName)}>
        {content}
      </div>
    </section>
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
        <div className="sticky top-16 z-30 flex border-b border-stone-200 bg-white dark:border-white/10 dark:bg-background">
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

        <div className="pt-2">
          {mobileTab === 'prompt' ? (
            <WritingPromptPaper
              annotations={currentAnnotations}
              framed={false}
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
        className={cn(
          'relative hidden h-full overflow-hidden lg:flex lg:items-stretch',
          isDragging && 'select-none'
        )}
      >
        <div
          className="min-h-0 shrink-0"
          style={{ width: `calc(${splitPercent}% - 6px)` }}
        >
          <WritingPromptPaper
            annotations={currentAnnotations}
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
          className="group relative flex w-3 shrink-0 cursor-col-resize items-center justify-center"
        >
          <div
            className={cn(
              'w-[3px] rounded-full group-hover:h-full group-hover:rounded-none',
              isDragging
                ? 'h-full rounded-none bg-[#0a84ff]'
                : 'h-10 bg-stone-300 group-hover:bg-stone-400 dark:bg-[#3f3f3f] dark:group-hover:bg-[#5a5a5a]'
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          <WritingResponsePanel
            className="h-full"
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
