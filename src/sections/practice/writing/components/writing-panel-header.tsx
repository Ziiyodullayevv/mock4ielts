'use client';

import type { ReactNode } from 'react';
import type { WritingTextSize } from '../types';

import { getWritingUITextStyle } from './writing-task-panel.shared';

type WritingPanelHeaderProps = {
  description: ReactNode;
  textSize: WritingTextSize;
  title: ReactNode;
};

export function WritingPanelHeader({
  description,
  textSize,
  title,
}: WritingPanelHeaderProps) {
  return (
    <div className="shrink-0 border-b border-[#dfdfdf] px-3 py-2.5 dark:border-white/10 sm:px-4">
      <div className="grid min-h-16 content-center gap-1.5">
        <h2
          style={getWritingUITextStyle(textSize, 'heading')}
          className="truncate font-semibold tracking-[-0.03em] text-stone-900 dark:text-white"
        >
          {title}
        </h2>
        <div
          style={getWritingUITextStyle(textSize, 'helper')}
          className="truncate text-stone-600 dark:text-white/62"
        >
          {description}
        </div>
      </div>
    </div>
  );
}
