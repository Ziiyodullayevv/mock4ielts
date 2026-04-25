'use client';

import type { WritingPart, WritingTextSize } from '../types';

import { cn } from '@/src/lib/utils';
import { useRef, useEffect } from 'react';

import { countWords } from '../utils';
import { getWritingTextStyle, getWritingUITextStyle } from './writing-task-panel.shared';

type WritingResponsePanelProps = {
  isReview?: boolean;
  onChange: (value: string) => void;
  task: WritingPart['task'];
  textSize: WritingTextSize;
  value: string;
};

type AutoResizeTextareaProps = {
  disabled?: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  textSize: WritingTextSize;
  value: string;
};

function AutoResizeTextarea({
  disabled,
  onChange,
  placeholder,
  textSize,
  value,
}: AutoResizeTextareaProps) {
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
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={20}
      style={getWritingTextStyle(textSize, 'response')}
      className={cn(
        'w-full resize-none overflow-hidden rounded-xl border border-stone-200 bg-white px-5 py-4 text-stone-800 outline-none transition-colors placeholder:text-stone-400 dark:border-white/10 dark:bg-[#111111] dark:text-white dark:placeholder:text-white/28',
        'focus:border-[#ffb347] focus:ring-2 focus:ring-[#ffb347]/18 dark:focus:border-[#ffb347] dark:focus:ring-[#ffb347]/20',
        disabled &&
          'cursor-default bg-stone-50 text-stone-600 dark:bg-white/4 dark:text-white/55'
      )}
    />
  );
}

export function WritingResponsePanel({
  isReview = false,
  onChange,
  task,
  textSize,
  value,
}: WritingResponsePanelProps) {
  const words = countWords(value);
  const meetsMinimum = words >= task.wordLimitMin;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
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
        disabled={isReview}
        onChange={onChange}
        placeholder={`Start writing your ${task.questionType === 'essay' ? 'essay' : 'description'} here...`}
        textSize={textSize}
      />

      <div className="flex items-center justify-between px-1">
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
