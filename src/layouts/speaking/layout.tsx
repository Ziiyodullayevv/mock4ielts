'use client';

import type { SpeakingTestLayoutProps } from './types';

import { PracticeShell } from '@/src/layouts/practice';
import { SpeakingTestFooter } from './footer';
import { SpeakingTestHeader } from './header';

export function SpeakingTestLayout({
  activePartKey,
  children,
  completedPartKeys,
  onExit,
  onPartChange,
  test,
  timeLeftSeconds,
}: SpeakingTestLayoutProps) {
  return (
    <PracticeShell
      rootClassName="bg-[radial-gradient(circle_at_top,rgba(255,159,47,0.10),transparent_32%),linear-gradient(180deg,#ffffff_0%,#fffaf3_100%)] text-stone-950 dark:bg-[radial-gradient(circle_at_top,rgba(255,159,47,0.14),transparent_32%),linear-gradient(180deg,#0b0b0d_0%,#121214_100%)] dark:text-white"
      mainClassName="max-w-[1480px] py-8 pb-40 sm:px-6 md:pb-32"
      header={
        <SpeakingTestHeader
          onExit={onExit}
          timeLeftSeconds={timeLeftSeconds}
        />
      }
      footer={
        <SpeakingTestFooter
          activePartKey={activePartKey}
          completedPartKeys={completedPartKeys}
          onPartChange={onPartChange}
          test={test}
        />
      }
    >
      {children}
    </PracticeShell>
  );
}
