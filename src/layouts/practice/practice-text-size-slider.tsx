'use client';

import type { PracticeTextSize } from '@/src/sections/practice/shared/practice-text-size';

import { cn } from '@/src/lib/utils';
import { RotateCcw } from 'lucide-react';
import { Slider as SliderPrimitive } from 'radix-ui';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip';
import {
  PRACTICE_TEXT_SIZE_MAX,
  PRACTICE_TEXT_SIZE_MIN,
  getPracticeTextSizeIndex,
  getPracticeTextSizeValue,
  PRACTICE_TEXT_SIZE_DEFAULT,
} from '@/src/sections/practice/shared/practice-text-size';

type PracticeTextSizeSliderProps = {
  menuOpen: boolean;
  onTextSizeChange: (textSize: PracticeTextSize) => void;
  textSize: PracticeTextSize;
};

export function PracticeTextSizeSlider({
  menuOpen,
  onTextSizeChange,
  textSize,
}: PracticeTextSizeSliderProps) {
  const activeSize = getPracticeTextSizeIndex(textSize);
  const totalSteps = PRACTICE_TEXT_SIZE_MAX - PRACTICE_TEXT_SIZE_MIN;
  const activePercent =
    totalSteps > 0 ? ((activeSize - PRACTICE_TEXT_SIZE_MIN) / totalSteps) * 100 : 0;

  return (
    <div className="px-0.5 pb-0.5">
      <div className="rounded-xl bg-stone-50 px-2.5 py-2.5 dark:bg-white/4">
        <button
          type="button"
          aria-label="Reset text size"
          title="Reset text size"
          onClick={() => {
            if (activeSize !== PRACTICE_TEXT_SIZE_DEFAULT) {
              onTextSizeChange(PRACTICE_TEXT_SIZE_DEFAULT);
            }
          }}
          className={cn(
            'inline-flex items-center gap-1 rounded-full text-left transition-colors',
            activeSize !== PRACTICE_TEXT_SIZE_DEFAULT
              ? 'cursor-pointer hover:text-slate-800 dark:hover:text-white'
              : 'cursor-default'
          )}
        >
          <span className="text-xs font-semibold text-slate-600 dark:text-white/60">Size</span>
          <span
            className={cn(
              'inline-flex size-5 items-center justify-center rounded-full transition-colors',
              activeSize !== PRACTICE_TEXT_SIZE_DEFAULT
                ? 'text-slate-500 hover:bg-stone-200 hover:text-slate-700 dark:text-white/45 dark:hover:bg-white/8 dark:hover:text-white/75'
                : 'text-transparent'
            )}
          >
            <RotateCcw className="size-3" strokeWidth={2} />
          </span>
        </button>

        <div className="pt-5">
          <div className="relative">
            <SliderPrimitive.Root
              value={[activeSize]}
              min={PRACTICE_TEXT_SIZE_MIN}
              max={PRACTICE_TEXT_SIZE_MAX}
              step={1}
              aria-label="Text size"
              onValueChange={(nextValue) =>
                onTextSizeChange(getPracticeTextSizeValue(nextValue[0] ?? PRACTICE_TEXT_SIZE_DEFAULT))
              }
              className="relative flex w-full touch-none items-center select-none"
            >
              <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
                {Array.from({ length: totalSteps + 1 }).map((_, index) => {
                  const tickPercent = totalSteps > 0 ? (index / totalSteps) * 100 : 0;
                  const isActiveTick = tickPercent <= activePercent;
                  const isEdgeTick = index === 0 || index === totalSteps;

                  if (isEdgeTick) {
                    return null;
                  }

                  return (
                    <span
                      key={tickPercent}
                      className={cn(
                        'absolute top-1/2 block h-2 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full',
                        isActiveTick
                          ? 'bg-white/75 dark:bg-white/65'
                          : 'bg-stone-300 dark:bg-white/18'
                      )}
                      style={{ left: `${tickPercent}%` }}
                    />
                  );
                })}
              </div>

              <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-[#eaedf1] dark:bg-white/10">
                <SliderPrimitive.Range className="absolute h-full bg-linear-to-r from-[#58d790] to-[#149174]" />
              </SliderPrimitive.Track>

              <Tooltip open={menuOpen}>
                <TooltipTrigger asChild>
                  <SliderPrimitive.Thumb className="relative z-10 block size-4.5 shrink-0 rounded-full border-[3px] border-white bg-[#eff3f7] shadow-[0_5px_12px_rgba(148,163,184,0.32)] outline-none" />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="center"
                  sideOffset={12}
                  avoidCollisions={false}
                  className="relative rounded-xl bg-[#1f2632] px-2 py-0.75 text-[11px] font-semibold text-white shadow-[0_10px_20px_rgba(15,23,42,0.2)] after:absolute after:left-1/2 after:top-full after:block after:size-1.5 after:-translate-x-1/2 after:-translate-y-0.5 after:rotate-45 after:rounded-[2px] after:bg-[#1f2632] after:content-[''] dark:bg-[#0f1114] dark:shadow-none dark:after:bg-[#0f1114]"
                >
                  {activeSize}px
                </TooltipContent>
              </Tooltip>
            </SliderPrimitive.Root>
          </div>
        </div>
      </div>
    </div>
  );
}
