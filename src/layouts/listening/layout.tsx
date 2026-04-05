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
  isPrimaryActionDisabled,
  isPrevDisabled,
  isReview = false,
  onPartChange,
  onPrevPart,
  onPrimaryAction,
  onQuestionSelect,
  primaryActionLabelOverride,
  prevActionLabel,
  test,
  timeLeftSeconds,
}: ListeningTestLayoutProps) {
  const isLastPart = activePart === test.parts.length;
  const primaryActionLabel =
    primaryActionLabelOverride ?? (isReview ? 'Retry' : isLastPart ? 'Submit' : 'Next');
  const resolvedIsPrevDisabled = isPrevDisabled ?? activePart === 1;

  return (
    <div className="min-h-screen bg-white text-stone-950">
      <ListeningTestHeader
        audioUrl={audioUrl}
        isPrimaryActionDisabled={isPrimaryActionDisabled}
        isPrevDisabled={resolvedIsPrevDisabled}
        isReview={isReview}
        onPrevPart={onPrevPart}
        onPrimaryAction={onPrimaryAction}
        prevActionLabel={prevActionLabel}
        primaryActionLabel={primaryActionLabel}
        timeLeftSeconds={timeLeftSeconds}
      />

      <main className="mx-auto max-w-[1000px] px-4 py-6 pb-32 md:pb-28">{children}</main>

      <ListeningTestFooter
        activePart={activePart}
        activeQuestionId={activeQuestionId}
        answers={answers}
        isPrimaryActionDisabled={isPrimaryActionDisabled}
        isPrevDisabled={resolvedIsPrevDisabled}
        onPrimaryAction={onPrimaryAction}
        onPartChange={onPartChange}
        onPrevPart={onPrevPart}
        onQuestionSelect={onQuestionSelect}
        prevActionLabel={prevActionLabel}
        primaryActionLabel={primaryActionLabel}
        test={test}
      />
    </div>
  );
}
