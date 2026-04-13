'use client';

import type { SpeakingTest } from '@/src/sections/practice/speaking/types';

import { cn } from '@/src/lib/utils';
import {
  PRACTICE_FOOTER_SHELL_CLASS,
  PRACTICE_FOOTER_TOP_BAR_CLASS,
  PRACTICE_FOOTER_ACTIVE_SURFACE_CLASS,
} from '@/src/layouts/practice-footer-theme';

type SpeakingTestFooterProps = {
  activePartKey: string | null;
  onPartChange: (partKey: string) => void;
  test: SpeakingTest;
};

export function SpeakingTestFooter({
  activePartKey,
  onPartChange,
  test,
}: SpeakingTestFooterProps) {
  const handlePartSelect = (partKey: string) => {
    onPartChange(partKey);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <footer className={PRACTICE_FOOTER_SHELL_CLASS}>
      <div className={PRACTICE_FOOTER_TOP_BAR_CLASS} />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-3">
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {test.parts.map((part, index) => {
            const isActive = activePartKey === part.partKey;

            return (
              <button
                key={part.partKey}
                type="button"
                onClick={() => handlePartSelect(part.partKey)}
                className={cn(
                  'flex h-12 items-center justify-center rounded-xl border text-sm font-semibold text-stone-900 transition-colors md:h-16 md:text-[1.05rem]',
                  isActive
                    ? PRACTICE_FOOTER_ACTIVE_SURFACE_CLASS
                    : 'border-border/60 bg-white hover:bg-stone-50'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                Part {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
