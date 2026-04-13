'use client';

import type { CSSProperties } from 'react';
import type { WritingTextSize } from '../types';

export type AnnotationBlockId = 'instructions' | 'prompt' | 'model-answer';
export type AnnotationColor = 'red' | 'yellow' | 'green' | 'blue';
export type WritingTextVariant = 'instruction' | 'model-answer' | 'prompt' | 'response';

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

export function getBlockLabel(blockId: AnnotationBlockId) {
  if (blockId === 'instructions') return 'Instructions';
  if (blockId === 'model-answer') return 'Model Answer';
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
