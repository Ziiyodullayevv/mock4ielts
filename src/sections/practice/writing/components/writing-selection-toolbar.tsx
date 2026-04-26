'use client';

import type { PointerEvent as ReactPointerEvent } from 'react';
import type { AnnotationColor } from './writing-task-panel.shared';
import type { FloatingPosition } from './writing-task-panel.annotation-utils';

import { cn } from '@/src/lib/utils';
import { Grip, Eraser, PencilLine } from 'lucide-react';
import { PRACTICE_HEADER_ACTIVE_BUTTON_CLASS } from '@/src/layouts/practice-footer-theme';
import {
  PRACTICE_HEADER_RING_CLASS,
  PRACTICE_MENU_PANEL_RING_CLASS,
} from '@/src/layouts/practice-surface-theme';

type SelectionToolbarProps = {
  activeColor: AnnotationColor;
  position: FloatingPosition;
  onApplyColor: (color: AnnotationColor) => void;
  onClear: () => void;
  onDragStart: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onOpenNotes: () => void;
};

const HIGHLIGHT_BUTTONS: Array<{
  color: AnnotationColor;
  className: string;
  label: string;
}> = [
  { color: 'red', className: 'bg-[#ff5d5d]', label: 'Red marker' },
  { color: 'yellow', className: 'bg-[#ffc62b]', label: 'Yellow marker' },
  { color: 'green', className: 'bg-[#18dd78]', label: 'Green marker' },
  { color: 'blue', className: 'bg-[#1ea7fd]', label: 'Blue marker' },
];

export function SelectionToolbar({
  activeColor,
  position,
  onApplyColor,
  onClear,
  onDragStart,
  onOpenNotes,
}: SelectionToolbarProps) {
  const toolbarCardClassName = cn(
    PRACTICE_MENU_PANEL_RING_CLASS,
    'rounded-full shadow-[0_16px_34px_rgba(15,23,42,0.24)] after:!bg-[#171717] dark:after:!bg-[#171717] dark:shadow-none'
  );
  const toolbarButtonRingClassName = cn(
    PRACTICE_HEADER_RING_CLASS,
    'inline-flex size-10 shrink-0 items-center justify-center rounded-full p-[3px] after:!bg-[#171717] dark:after:!bg-[#171717]'
  );

  return (
    <div
      className="fixed z-[90] flex w-max flex-col items-center gap-2"
      style={{ left: position.x, top: position.y }}
    >
      <div className={cn(toolbarCardClassName, 'flex items-center gap-2 px-2.5 py-2')}>
        {HIGHLIGHT_BUTTONS.map((button) => {
          const isActive = button.color === activeColor;

          return (
            <div
              key={button.label}
              className={cn(
                toolbarButtonRingClassName,
                isActive &&
                  'shadow-[0_0_0_1px_rgba(255,179,71,0.24)] dark:shadow-[0_0_0_1px_rgba(255,179,71,0.24)]'
              )}
            >
              <button
                type="button"
                aria-label={button.label}
                onClick={() => onApplyColor(button.color)}
                className={cn(
                  'size-8 rounded-full transition-transform duration-150 hover:scale-105',
                  button.className,
                  isActive && 'ring-2 ring-white/45'
                )}
              />
            </div>
          );
        })}
      </div>

      <div className={cn(toolbarCardClassName, 'flex items-center gap-1.5 px-2 py-2')}>
        <div className={toolbarButtonRingClassName}>
          <button
            type="button"
            aria-label="Drag selection controls"
            onPointerDown={onDragStart}
            className="inline-flex size-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/8 hover:text-white"
          >
            <Grip className="size-[16px]" strokeWidth={2.1} />
          </button>
        </div>

        <div className={toolbarButtonRingClassName}>
          <button
            type="button"
            aria-label="Remove highlight"
            onClick={onClear}
            className="inline-flex size-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/8 hover:text-white"
          >
            <Eraser className="size-[16px]" strokeWidth={2.1} />
          </button>
        </div>

        <button
          type="button"
          aria-label="Open notes"
          onClick={onOpenNotes}
          className={cn(
            'inline-flex size-10 items-center justify-center rounded-full border text-white shadow-[0_12px_28px_rgba(255,120,75,0.24)] transition-all hover:brightness-105',
            PRACTICE_HEADER_ACTIVE_BUTTON_CLASS
          )}
        >
          <PencilLine className="size-[15px]" strokeWidth={2.1} />
        </button>
      </div>
    </div>
  );
}
