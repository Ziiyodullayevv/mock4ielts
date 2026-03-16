'use client';

import { useRef, useEffect } from 'react';

const DRAG_SCROLL_EDGE_OFFSET = 140;
const DRAG_SCROLL_MAX_STEP = 20;

function getDragScrollDelta(pointerY: number, viewportHeight: number) {
  if (pointerY < DRAG_SCROLL_EDGE_OFFSET) {
    const intensity = (DRAG_SCROLL_EDGE_OFFSET - pointerY) / DRAG_SCROLL_EDGE_OFFSET;
    return -Math.max(6, Math.round(intensity * DRAG_SCROLL_MAX_STEP));
  }

  const lowerEdgeStart = viewportHeight - DRAG_SCROLL_EDGE_OFFSET;

  if (pointerY > lowerEdgeStart) {
    const intensity = (pointerY - lowerEdgeStart) / DRAG_SCROLL_EDGE_OFFSET;
    return Math.max(6, Math.round(intensity * DRAG_SCROLL_MAX_STEP));
  }

  return 0;
}

export function useDragAutoScroll(isDragging: boolean) {
  const pointerYRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const stopAutoScroll = () => {
      pointerYRef.current = null;

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    if (!isDragging) {
      stopAutoScroll();
      return undefined;
    }

    const tick = () => {
      const pointerY = pointerYRef.current;

      if (pointerY === null) {
        animationFrameRef.current = null;
        return;
      }

      const delta = getDragScrollDelta(pointerY, window.innerHeight);

      if (delta !== 0) {
        window.scrollBy({ top: delta });
      }

      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    const startAutoScroll = () => {
      if (animationFrameRef.current === null) {
        animationFrameRef.current = window.requestAnimationFrame(tick);
      }
    };

    const handleDragOver = (event: DragEvent) => {
      pointerYRef.current = event.clientY;
      startAutoScroll();
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', stopAutoScroll);
    window.addEventListener('dragend', stopAutoScroll);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', stopAutoScroll);
      window.removeEventListener('dragend', stopAutoScroll);
      stopAutoScroll();
    };
  }, [isDragging]);
}
