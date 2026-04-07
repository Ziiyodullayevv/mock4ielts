'use client';

import type { ReadingTestLayoutProps } from './types';

import { ReadingTestFooter } from './footer';
import { ReadingTestHeader } from './header';

export function ReadingTestLayout({
  activePart,
  activeQuestionId,
  answers,
  children,
  isPrimaryActionDisabled,
  isPrevDisabled,
  isReview = false,
  onLogoClick,
  onPartChange,
  onPrevPart,
  onPrimaryAction,
  onQuestionSelect,
  primaryActionLabelOverride,
  prevActionLabel,
  test,
  timeLeftSeconds,
}: ReadingTestLayoutProps) {
  const isLastPart = activePart === test.parts.length;
  const primaryActionLabel =
    primaryActionLabelOverride ?? (isReview ? 'Retry' : isLastPart ? 'Submit' : 'Next');
  const resolvedIsPrevDisabled = isPrevDisabled ?? activePart === 1;

  return (
    <div className="min-h-screen bg-white text-stone-950">
      <ReadingTestHeader
        isPrimaryActionDisabled={isPrimaryActionDisabled}
        isPrevDisabled={resolvedIsPrevDisabled}
        isReview={isReview}
        onLogoClick={onLogoClick}
        onPrevPart={onPrevPart}
        onPrimaryAction={onPrimaryAction}
        prevActionLabel={prevActionLabel}
        primaryActionLabel={primaryActionLabel}
        timeLeftSeconds={timeLeftSeconds}
      />

      <main className="mx-auto max-w-[1380px] px-4 py-6 pb-32 md:pb-28">{children}</main>

      <ReadingTestFooter
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
