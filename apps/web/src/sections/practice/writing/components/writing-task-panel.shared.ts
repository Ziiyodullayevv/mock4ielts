'use client';

import type { CSSProperties } from 'react';
import type { WritingTextSize } from '../types';

export type AnnotationBlockId = string;
export type AnnotationColor = 'red' | 'yellow' | 'green' | 'blue';
export type WritingTextVariant = 'instruction' | 'model-answer' | 'prompt' | 'response';
export type WritingUITextVariant =
  | 'badge'
  | 'eyebrow'
  | 'heading'
  | 'heading-large'
  | 'helper'
  | 'meta'
  | 'tab';

export type TextAnnotation = {
  blockId: AnnotationBlockId;
  color: AnnotationColor;
  end: number;
  id: string;
  note?: string;
  start: number;
};

export type PendingSelection = {
  annotationId?: string;
  blockId: AnnotationBlockId;
  end: number;
  start: number;
  text: string;
};

export type SavedNoteItem = {
  blockLabel: string;
  color: AnnotationColor;
  id: string;
  note: string;
  selection: PendingSelection;
};

export function getWritingTextStyle(
  textSize: WritingTextSize,
  variant: WritingTextVariant
): CSSProperties {
  let fontSize = textSize;

  if (variant === 'instruction') {
    fontSize = Math.max(13, textSize - 2);
  } else if (variant === 'model-answer') {
    fontSize = Math.max(13, textSize - 1);
  }

  const lineHeight = variant === 'instruction' ? fontSize + 10 : fontSize + 12;

  return {
    fontSize: `${fontSize}px`,
    lineHeight: `${lineHeight}px`,
  };
}

export function getWritingUITextStyle(
  textSize: WritingTextSize,
  variant: WritingUITextVariant
): CSSProperties {
  let fontSize = textSize;
  let lineHeight = textSize + 6;

  switch (variant) {
    case 'eyebrow':
      fontSize = Math.max(9, textSize - 4);
      lineHeight = fontSize + 6;
      break;
    case 'heading':
      fontSize = textSize + 4;
      lineHeight = fontSize + 8;
      break;
    case 'heading-large':
      fontSize = textSize + 6;
      lineHeight = fontSize + 8;
      break;
    case 'helper':
      fontSize = Math.max(12, textSize - 1);
      lineHeight = fontSize + 8;
      break;
    case 'meta':
      fontSize = Math.max(11, textSize - 2);
      lineHeight = fontSize + 6;
      break;
    case 'tab':
      fontSize = Math.max(12, textSize - 1);
      lineHeight = fontSize + 6;
      break;
    case 'badge':
      fontSize = Math.max(9, textSize - 4);
      lineHeight = fontSize + 2;
      break;
    default:
      break;
  }

  return {
    fontSize: `${fontSize}px`,
    lineHeight: `${lineHeight}px`,
  };
}

export function getBlockLabel(blockId: AnnotationBlockId) {
  if (blockId === 'instructions') return 'Instructions';
  if (blockId === 'model-answer') return 'Model Answer';
  if (blockId === 'prompt') return 'Prompt';
  return 'Prompt';
}

export function getSelectionFromAnnotation(
  annotation: TextAnnotation,
  textByBlock: Record<AnnotationBlockId, string>
): PendingSelection {
  return {
    annotationId: annotation.id,
    blockId: annotation.blockId,
    end: annotation.end,
    start: annotation.start,
    text: textByBlock[annotation.blockId].slice(annotation.start, annotation.end),
  };
}
