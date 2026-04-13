'use client';

import type { PointerEvent as ReactPointerEvent } from 'react';
import type { AnnotationColor } from './writing-task-panel.shared';
import type { FloatingPosition } from './writing-task-panel.annotation-utils';

import { cn } from '@/src/lib/utils';
import { Grip, Eraser, PencilLine } from 'lucide-react';

type SelectionToolbarProps = {
  activeColor: AnnotationColor;
  position: FloatingPosition;
  onApplyColor: (color: AnnotationColor) => void;
  onClear: () => void;
  onDragStart: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onOpenNotes: () => void;
};

const HIGHLIGHT_BUTTONS: Array<{
  color?: AnnotationColor;
  className: string;
  label: string;
}> = [
  { color: 'red', className: 'bg-[#ff5d5d]', label: 'Red marker' },
  { color: 'yellow', className: 'bg-[#ffc62b]', label: 'Yellow marker' },
  { color: 'green', className: 'bg-[#18dd78]', label: 'Green marker' },
  { color: 'blue', className: 'bg-[#1ea7fd]', label: 'Blue marker' },
  {
    className: 'bg-white ring-1 ring-black/12',
    label: 'Clear highlight',
  },
];

export function SelectionToolbar({
  activeColor,
  position,
  onApplyColor,
  onClear,
  onDragStart,
  onOpenNotes,
}: SelectionToolbarProps) {
  return (
    <div
      className="fixed z-[90] flex w-[14.5rem] flex-col items-center gap-2"
      style={{ left: position.x, top: position.y }}
    >
      <div className="flex items-center gap-2.5 rounded-full bg-[#171717] px-4 py-3 shadow-[0_16px_34px_rgba(15,23,42,0.24)]">
        {HIGHLIGHT_BUTTONS.map((button) => {
          const isActive = button.color === activeColor;
          const isClearAction = !button.color;

          return (
            <button
              key={button.label}
              type="button"
              aria-label={button.label}
              onClick={() => (button.color ? onApplyColor(button.color) : onClear())}
              className={cn(
                'size-8 rounded-full transition-transform duration-150 hover:scale-105',
                button.className,
                isActive &&
                  !isClearAction &&
                  'ring-2 ring-white/35 ring-offset-2 ring-offset-[#171717]',
                isClearAction && 'shadow-[inset_0_0_0_1px_rgba(15,23,42,0.12)]'
              )}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 rounded-full bg-[#171717] px-2.5 py-2.5 shadow-[0_16px_34px_rgba(15,23,42,0.24)]">
        <button
          type="button"
          aria-label="Drag selection controls"
          onPointerDown={onDragStart}
          className="inline-flex size-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/8 hover:text-white"
        >
          <Grip className="size-[16px]" strokeWidth={2.1} />
        </button>

        <button
          type="button"
          aria-label="Remove highlight"
          onClick={onClear}
          className="inline-flex size-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/8 hover:text-white"
        >
          <Eraser className="size-[16px]" strokeWidth={2.1} />
        </button>

        <button
          type="button"
          aria-label="Open notes"
          onClick={onOpenNotes}
          className="inline-flex size-8 items-center justify-center rounded-full bg-[#27457a] text-white transition-colors hover:bg-[#315694]"
        >
          <PencilLine className="size-[15px]" strokeWidth={2.1} />
        </button>
      </div>
    </div>
  );
}
