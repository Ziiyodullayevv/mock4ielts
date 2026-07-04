'use client';

import type { WritingPart, WritingTextSize } from '../types';

import { cn } from '@/src/lib/utils';
import { useRef, useEffect } from 'react';

import { countWords } from '../utils';
import { WritingPanelHeader } from './writing-panel-header';
import { getWritingTextStyle, getWritingUITextStyle } from './writing-task-panel.shared';

type WritingResponsePanelProps = {
  className?: string;
  isReview?: boolean;
  onChange: (value: string) => void;
  task: WritingPart['task'];
  textSize: WritingTextSize;
  value: string;
};

type AutoResizeTextareaProps = {
  className?: string;
  disabled?: boolean;
  fixedHeight?: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  textSize: WritingTextSize;
  value: string;
};

function AutoResizeTextarea({
  className,
  disabled,
  fixedHeight = false,
  onChange,
  placeholder,
  textSize,
  value,
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (fixedHeight) return;

    const el = textareaRef.current;
    if (!el) return;

    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [fixedHeight, value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={20}
      style={getWritingTextStyle(textSize, 'response')}
      className={cn(
        'w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-800 outline-none transition-colors placeholder:text-stone-400 dark:border-white/10 dark:bg-[#111111] dark:text-white dark:placeholder:text-white/28',
        fixedHeight ? 'h-full min-h-0 overflow-y-auto' : 'overflow-hidden',
        'focus:border-[#ffb347] focus:ring-2 focus:ring-[#ffb347]/18 dark:focus:border-[#ffb347] dark:focus:ring-[#ffb347]/20',
        disabled &&
          'cursor-default bg-stone-50 text-stone-600 dark:bg-white/4 dark:text-white/55',
        className
      )}
    />
  );
}

export function WritingResponsePanel({
  className,
  isReview = false,
  onChange,
  task,
  textSize,
  value,
}: WritingResponsePanelProps) {
  const words = countWords(value);
  const meetsMinimum = words >= task.wordLimitMin;
  const isWorkspacePanel = Boolean(className);

  if (isWorkspacePanel) {
    return (
      <section className={cn('flex min-h-0 flex-col overflow-hidden rounded-lg border border-stone-200/80 bg-white dark:border-white/10 dark:bg-[#1f1f1f]', className)}>
        <WritingPanelHeader
          description={`${words} / ${task.wordLimitMin} words`}
          textSize={textSize}
          title="Your Response"
        />

        <div className="flex min-h-0 flex-1 flex-col">
          <AutoResizeTextarea
            value={value}
            className="flex-1 rounded-none border-0 bg-white shadow-none focus:border-transparent focus:ring-0 dark:bg-[#262626] dark:focus:border-transparent dark:focus:ring-0"
            disabled={isReview}
            fixedHeight
            onChange={onChange}
            placeholder={`Start writing your ${task.questionType === 'essay' ? 'essay' : 'description'} here...`}
            textSize={textSize}
          />
        </div>

        <div className="flex h-8 shrink-0 items-center justify-between border-t border-dashed border-stone-200/80 px-4 dark:border-white/10">
          <span
            style={getWritingUITextStyle(textSize, 'meta')}
            className={cn(
              'font-medium tabular-nums transition-colors',
              words === 0
                ? 'text-stone-400 dark:text-[#858585]'
                : meetsMinimum
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
            )}
          >
            {words} word{words !== 1 ? 's' : ''}
          </span>
          <span
            style={getWritingUITextStyle(textSize, 'meta')}
            className="text-stone-400 dark:text-[#858585]"
          >
            Minimum: {task.wordLimitMin} words
          </span>
        </div>
      </section>
    );
  }

  return (
    <div className={cn('flex min-h-0 flex-col gap-3', className)}>
      <div className="shrink-0 space-y-2">
        <h3
          style={getWritingUITextStyle(textSize, 'heading')}
          className="font-semibold tracking-[-0.03em] text-stone-800 dark:text-white"
        >
          Your response
        </h3>
        {isReview ? (
          <p
            style={getWritingUITextStyle(textSize, 'helper')}
            className="text-stone-500 dark:text-white/55"
          >
            Review your submitted essay below.
          </p>
        ) : (
          <p
            style={getWritingUITextStyle(textSize, 'helper')}
            className="text-stone-500 dark:text-white/55"
          >
            Write at least{' '}
            <span className="font-semibold text-stone-700 dark:text-white/82">
              {task.wordLimitMin} words
            </span>
            .
            {task.timeRecommendedMinutes
              ? ` Recommended time: ${task.timeRecommendedMinutes} minutes.`
              : ''}
          </p>
        )}
      </div>

      <AutoResizeTextarea
        value={value}
        className="flex-1"
        disabled={isReview}
        fixedHeight={Boolean(className)}
        onChange={onChange}
        placeholder={`Start writing your ${task.questionType === 'essay' ? 'essay' : 'description'} here...`}
        textSize={textSize}
      />

      <div className="flex shrink-0 items-center justify-between px-1">
        <span
          style={getWritingUITextStyle(textSize, 'meta')}
          className={cn(
            'font-medium tabular-nums transition-colors',
            words === 0
              ? 'text-stone-400 dark:text-white/35'
              : meetsMinimum
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400'
          )}
        >
          {words} word{words !== 1 ? 's' : ''}
        </span>
        <span
          style={getWritingUITextStyle(textSize, 'meta')}
          className="text-stone-400 dark:text-white/35"
        >
          Minimum: {task.wordLimitMin} words
        </span>
      </div>
    </div>
  );
}
