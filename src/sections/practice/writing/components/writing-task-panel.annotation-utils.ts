'use client';

import type { PointerEvent as ReactPointerEvent } from 'react';
import type {
  TextAnnotation,
  AnnotationColor,
  PendingSelection,
  AnnotationBlockId,
} from './writing-task-panel.shared';

export type FloatingPosition = {
  manual?: boolean;
  x: number;
  y: number;
};

export type ToolbarState = {
  position: FloatingPosition;
  selection: PendingSelection;
};

export type NoteSheetState = {
  draft: string;
  selection: PendingSelection | null;
};

export const TOOLBAR_WIDTH = 232;
export const TOOLBAR_HEIGHT = 110;
export const DEFAULT_HIGHLIGHT_COLOR: AnnotationColor = 'yellow';

const TOOLBAR_OFFSET = 12;
const FLOATING_PADDING = 16;

function createAnnotationId() {
  return `annotation-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function clampPosition(value: number, max: number) {
  return Math.max(FLOATING_PADDING, Math.min(value, max));
}

function getFloatingBounds(width: number, height: number) {
  return {
    maxX: Math.max(FLOATING_PADDING, window.innerWidth - width - FLOATING_PADDING),
    maxY: Math.max(FLOATING_PADDING, window.innerHeight - height - FLOATING_PADDING),
  };
}

export function clampFloatingPosition(position: FloatingPosition, width: number, height: number) {
  const { maxX, maxY } = getFloatingBounds(width, height);

  return {
    ...position,
    x: clampPosition(position.x, maxX),
    y: clampPosition(position.y, maxY),
  };
}

export function createToolbarPosition(rect: DOMRect): FloatingPosition {
  const { maxX, maxY } = getFloatingBounds(TOOLBAR_WIDTH, TOOLBAR_HEIGHT);
  const centeredX = rect.left + rect.width / 2 - TOOLBAR_WIDTH / 2;
  const preferredY = rect.top - TOOLBAR_HEIGHT - TOOLBAR_OFFSET;
  const fallbackY = rect.bottom + TOOLBAR_OFFSET;

  return {
    x: clampPosition(centeredX, maxX),
    y: clampPosition(preferredY >= FLOATING_PADDING ? preferredY : fallbackY, maxY),
  };
}

export function beginFloatingDrag(
  event: ReactPointerEvent<HTMLElement>,
  position: FloatingPosition,
  width: number,
  height: number,
  onUpdate: (position: FloatingPosition) => void
) {
  event.preventDefault();
  event.stopPropagation();

  const offsetX = event.clientX - position.x;
  const offsetY = event.clientY - position.y;

  const handlePointerMove = (moveEvent: PointerEvent) => {
    onUpdate(
      clampFloatingPosition(
        {
          manual: true,
          x: moveEvent.clientX - offsetX,
          y: moveEvent.clientY - offsetY,
        },
        width,
        height
      )
    );
  };

  const handlePointerUp = () => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };

  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
}

function sortAnnotations(annotations: TextAnnotation[]) {
  return [...annotations].sort((left, right) => {
    if (left.blockId !== right.blockId) {
      return left.blockId.localeCompare(right.blockId);
    }

    return left.start - right.start;
  });
}

function rangesOverlap(startA: number, endA: number, startB: number, endB: number) {
  return startA < endB && startB < endA;
}

export function isSameSelection(
  left: PendingSelection | null | undefined,
  right: PendingSelection | null | undefined
) {
  if (!left && !right) return true;
  if (!left || !right) return false;

  return (
    left.annotationId === right.annotationId &&
    left.blockId === right.blockId &&
    left.start === right.start &&
    left.end === right.end
  );
}

export function upsertAnnotation(
  annotations: TextAnnotation[],
  selection: PendingSelection,
  color: AnnotationColor,
  note?: string
) {
  const existingAnnotation = selection.annotationId
    ? annotations.find((annotation) => annotation.id === selection.annotationId)
    : undefined;

  const nextAnnotation: TextAnnotation = {
    blockId: selection.blockId,
    color,
    end: selection.end,
    id: existingAnnotation?.id ?? createAnnotationId(),
    note,
    start: selection.start,
  };

  const filteredAnnotations = annotations.filter((annotation) => {
    if (annotation.id === existingAnnotation?.id) return false;
    if (annotation.blockId !== selection.blockId) return true;
    return !rangesOverlap(annotation.start, annotation.end, selection.start, selection.end);
  });

  return {
    annotation: nextAnnotation,
    annotations: sortAnnotations([...filteredAnnotations, nextAnnotation]),
  };
}

export function removeAnnotationsForSelection(
  annotations: TextAnnotation[],
  selection: PendingSelection
) {
  return annotations.filter((annotation) => {
    if (annotation.blockId !== selection.blockId) return true;
    return !rangesOverlap(annotation.start, annotation.end, selection.start, selection.end);
  });
}

function getBlockElement(node: Node | null) {
  if (!node) return null;
  const element = node instanceof HTMLElement ? node : node.parentElement;
  return element?.closest<HTMLElement>('[data-writing-block-id]') ?? null;
}

export function resolveSelectionFromDOM(
  selection: Selection,
  textByBlock: Record<AnnotationBlockId, string>
): (PendingSelection & { rect: DOMRect }) | null {
  if (selection.rangeCount === 0 || selection.isCollapsed) return null;

  const range = selection.getRangeAt(0);
  const startBlock = getBlockElement(range.startContainer);
  const endBlock = getBlockElement(range.endContainer);

  if (!startBlock || !endBlock || startBlock !== endBlock) return null;

  const blockId = startBlock.dataset.writingBlockId as AnnotationBlockId | undefined;
  if (!blockId) return null;

  const startRange = range.cloneRange();
  startRange.selectNodeContents(startBlock);
  startRange.setEnd(range.startContainer, range.startOffset);

  const endRange = range.cloneRange();
  endRange.selectNodeContents(startBlock);
  endRange.setEnd(range.endContainer, range.endOffset);

  const start = Math.min(startRange.toString().length, endRange.toString().length);
  const end = Math.max(startRange.toString().length, endRange.toString().length);

  if (start === end) return null;

  return {
    blockId,
    end,
    rect: range.getBoundingClientRect(),
    start,
    text: textByBlock[blockId].slice(start, end),
  };
}
