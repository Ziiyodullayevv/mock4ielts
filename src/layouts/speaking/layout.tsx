'use client';

import type { SpeakingTestLayoutProps } from './types';

import { SpeakingTestFooter } from './footer';
import { SpeakingTestHeader } from './header';

export function SpeakingTestLayout({
  activePartKey,
  children,
  isPrimaryActionDisabled,
  isPrevDisabled,
  onPartChange,
  onPrevPart,
  onPrimaryAction,
  test,
  timeLeftSeconds,
}: SpeakingTestLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.08),transparent_32%),linear-gradient(180deg,#ffffff_0%,#fff9fb_100%)] text-stone-950">
      <SpeakingTestHeader
        isPrimaryActionDisabled={isPrimaryActionDisabled}
        isPrevDisabled={isPrevDisabled}
        onPrevPart={onPrevPart}
        onPrimaryAction={onPrimaryAction}
        timeLeftSeconds={timeLeftSeconds}
      />

      <main className="mx-auto max-w-[1480px] px-4 py-8 pb-40 sm:px-6 md:pb-32">{children}</main>

      <SpeakingTestFooter
        activePartKey={activePartKey}
        onPartChange={onPartChange}
        test={test}
      />
    </div>
  );
}
