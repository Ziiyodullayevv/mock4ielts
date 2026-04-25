'use client';

import type { SpeakingTest } from '@/src/sections/practice/speaking/types';

import React from 'react';
import { Check, Lock } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import GradualBlur from '@/src/components/GradualBlur';
import { PRACTICE_HEADER_RING_CLASS } from '@/src/layouts/practice-surface-theme';

type SpeakingTestFooterProps = {
  activePartKey: string | null;
  completedPartKeys: Set<string>;
  onPartChange: (partKey: string) => void;
  test: SpeakingTest;
};

export function SpeakingTestFooter({
  activePartKey,
  completedPartKeys,
  onPartChange,
  test,
}: SpeakingTestFooterProps) {
  const activePartIndex = Math.max(
    0,
    test.parts.findIndex((part) => part.partKey === activePartKey)
  );

  const handleStepClick = (partKey: string, partIndex: number) => {
    if (partIndex > activePartIndex) {
      const prevPart = test.parts[partIndex - 1];
      if (!prevPart || !completedPartKeys.has(prevPart.partKey)) return;
    }
    onPartChange(partKey);
  };

  return (
    <footer className="fixed inset-x-0 bottom-0 z-30 w-screen overflow-hidden bg-linear-to-t from-background from-30% to-transparent to-100% dark:from-background dark:from-30% dark:to-transparent dark:to-100% isolate">
      <GradualBlur
        target="parent"
        position="bottom"
        height="4rem"
        strength={1}
        divCount={2}
        curve="bezier"
        exponential
        opacity={1}
        zIndex={0}
      />
      <div className="relative z-10 mx-auto max-w-lg px-8 py-3">
        {/* Circles + lines row: items-start so mt on lines aligns them to circle center */}
        <div className="flex items-start">
          {test.parts.map((part, index) => {
            const isActive = part.partKey === activePartKey;
            const isCompleted = completedPartKeys.has(part.partKey);
            const isLast = index === test.parts.length - 1;
            const isLocked =
              index > activePartIndex &&
              (() => {
                const prevPart = test.parts[index - 1];
                return !prevPart || !completedPartKeys.has(prevPart.partKey);
              })();
            const isClickable = !isLocked;

            // Line after this circle is green only if THIS step is completed
            const lineAfterIsGreen = completedPartKeys.has(part.partKey);

            return (
              <React.Fragment key={part.partKey}>
                {/* Step column: circle + label */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => isClickable && handleStepClick(part.partKey, index)}
                    disabled={!isClickable}
                    aria-label={`Go to step ${index + 1}`}
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-300',
                      isCompleted
                        ? [
                            "cursor-pointer relative overflow-hidden border-0! bg-transparent! text-white shadow-[0_0_18px_rgba(34,197,94,0.40)]",
                            "before:absolute before:inset-0 before:rounded-full before:bg-[linear-gradient(135deg,#4ade80_0%,#22c55e_55%,#16a34a_100%)] before:content-['']",
                            "after:absolute after:inset-0.5 after:rounded-full after:bg-[#22c55e] after:content-['']",
                            "*:relative *:z-10",
                          ]
                        : isActive
                          ? [PRACTICE_HEADER_RING_CLASS, 'cursor-pointer text-stone-800 dark:text-white']
                          : isLocked
                            ? [PRACTICE_HEADER_RING_CLASS, 'cursor-not-allowed opacity-40 text-stone-400 dark:text-white/50']
                            : [PRACTICE_HEADER_RING_CLASS, 'cursor-pointer text-stone-600 dark:text-white/70 hover:opacity-90']
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-5" strokeWidth={2.5} />
                    ) : isLocked ? (
                      <Lock className="size-4" strokeWidth={2} />
                    ) : (
                      <span className={cn('text-sm font-semibold', isActive ? 'text-stone-800 dark:text-white' : 'text-stone-400 dark:text-white/50')}>
                        {index + 1}
                      </span>
                    )}
                  </button>
                  <span className={cn(
                    'mt-1.5 text-[10px] font-semibold tracking-widest uppercase',
                    isActive ? 'text-stone-700 dark:text-white' : 'text-stone-400 dark:text-white/40'
                  )}>
                    Part {index + 1}
                  </span>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      'mt-4.25 h-0.75 flex-1 mx-3 rounded-full transition-colors duration-300',
                      lineAfterIsGreen ? 'bg-[#22c55e]' : 'bg-stone-200 dark:bg-white/15'
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
