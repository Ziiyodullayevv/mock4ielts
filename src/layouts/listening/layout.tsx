'use client';

import type { ListeningTestLayoutProps } from './types';

import { ListeningTestFooter } from './footer';
import { ListeningTestHeader } from './header';

export function ListeningTestLayout({
  activePart,
  activeQuestionId,
  audioUrl,
  answers,
  children,
  isReview = false,
  onPartChange,
  onPrevPart,
  onPrimaryAction,
  onQuestionSelect,
  test,
  timeLeftSeconds,
}: ListeningTestLayoutProps) {
  const isLastPart = activePart === test.parts.length;
  const primaryActionLabel = isReview ? 'Retry' : isLastPart ? 'Submit' : 'Next';
  const isPrevDisabled = activePart === 1;

  return (
    <div className="min-h-screen bg-white text-stone-950">
      <ListeningTestHeader
        audioUrl={audioUrl}
        isPrevDisabled={isPrevDisabled}
        isReview={isReview}
        onPrevPart={onPrevPart}
        onPrimaryAction={onPrimaryAction}
        primaryActionLabel={primaryActionLabel}
        timeLeftSeconds={timeLeftSeconds}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 pb-32 md:pb-28">{children}</main>

      <ListeningTestFooter
        activePart={activePart}
        activeQuestionId={activeQuestionId}
        answers={answers}
        onPartChange={onPartChange}
        onQuestionSelect={onQuestionSelect}
        test={test}
      />
    </div>
  );
}
