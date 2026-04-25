'use client';

import type { MockExamSection } from '../api/mock-exams-api';

import React from 'react';
import { cn } from '@/src/lib/utils';
import { Lock, Check } from 'lucide-react';
import { PRACTICE_HEADER_RING_CLASS } from '@/src/layouts/practice-surface-theme';

type MockExamSectionStepperProps = {
  activeType: MockExamSection['type'] | null;
  completedTypes: Set<MockExamSection['type']>;
  onSectionSelect: (sectionType: MockExamSection['type']) => void;
  sections: MockExamSection[];
};

export function MockExamSectionStepper({
  activeType,
  completedTypes,
  onSectionSelect,
  sections,
}: MockExamSectionStepperProps) {
  const activeIndex = Math.max(
    0,
    sections.findIndex((section) => section.type === activeType)
  );

  return (
    <div className="pointer-events-none fixed left-3 top-24 z-[75]">
      <div className="pointer-events-auto rounded-[28px] border border-stone-200/85 bg-white/90 px-4 py-5 shadow-[0_20px_48px_rgba(15,23,42,0.10)] backdrop-blur-md dark:border-white/10 dark:bg-[#111111]/88 dark:shadow-[0_24px_60px_rgba(0,0,0,0.34)]">
        <div className="flex flex-col items-center">
          {sections.map((section, index) => {
            const isActive = section.type === activeType;
            const isCompleted = completedTypes.has(section.type);
            const isLast = index === sections.length - 1;
            const isLocked =
              index > activeIndex &&
              (() => {
                const previousSection = sections[index - 1];

                return !previousSection || !completedTypes.has(previousSection.type);
              })();
            const isClickable = !isLocked;
            const lineAfterIsGreen = completedTypes.has(section.type);

            return (
              <React.Fragment key={section.type}>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => isClickable && onSectionSelect(section.type)}
                    disabled={!isClickable}
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full transition-all duration-300',
                      isCompleted
                        ? [
                            "cursor-pointer relative overflow-hidden border-0 bg-transparent text-white shadow-[0_0_18px_rgba(34,197,94,0.40)]",
                            "before:absolute before:inset-0 before:rounded-full before:bg-[linear-gradient(135deg,#4ade80_0%,#22c55e_55%,#16a34a_100%)] before:content-['']",
                            "after:absolute after:inset-0.5 after:rounded-full after:bg-[#22c55e] after:content-['']",
                            '*:relative *:z-10',
                          ]
                        : isActive
                          ? [PRACTICE_HEADER_RING_CLASS, 'cursor-pointer text-stone-800 dark:text-white']
                          : isLocked
                            ? [
                                PRACTICE_HEADER_RING_CLASS,
                                'cursor-not-allowed opacity-40 text-stone-400 dark:text-white/50',
                              ]
                            : [
                                PRACTICE_HEADER_RING_CLASS,
                                'cursor-pointer text-stone-600 hover:opacity-90 dark:text-white/70',
                              ]
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-5" strokeWidth={2.5} />
                    ) : isLocked ? (
                      <Lock className="size-4" strokeWidth={2} />
                    ) : (
                      <span
                        className={cn(
                          'text-sm font-semibold capitalize',
                          isActive
                            ? 'text-stone-800 dark:text-white'
                            : 'text-stone-400 dark:text-white/50'
                        )}
                      >
                        {index + 1}
                      </span>
                    )}
                  </button>
                  <span
                    className={cn(
                      'mt-2 text-[10px] font-semibold tracking-[0.18em] uppercase whitespace-nowrap',
                      isActive
                        ? 'text-stone-700 dark:text-white'
                        : 'text-stone-400 dark:text-white/40'
                    )}
                  >
                    {section.type}
                  </span>
                </div>

                {!isLast ? (
                  <div
                    className={cn(
                      'my-2 h-10 w-0.75 rounded-full transition-colors duration-300',
                      lineAfterIsGreen ? 'bg-[#22c55e]' : 'bg-stone-200 dark:bg-white/15'
                    )}
                  />
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
