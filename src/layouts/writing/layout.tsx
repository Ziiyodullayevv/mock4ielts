'use client';

import type { WritingTestLayoutProps } from './types';

import { WritingTestFooter } from './footer';
import { WritingTestHeader } from './header';

export function WritingTestLayout({
  activePart,
  answers,
  children,
  isPrimaryActionDisabled,
  isPrevDisabled,
  isReview = false,
  onLogoClick,
  onPartChange,
  onPrevPart,
  onPrimaryAction,
  onTextSizeChange,
  primaryActionLabelOverride,
  prevActionLabel,
  test,
  textSize,
  timeLeftSeconds,
}: WritingTestLayoutProps) {
  const isLastPart = activePart === test.parts.length;
  const primaryActionLabel =
    primaryActionLabelOverride ?? (isReview ? 'Retry' : isLastPart ? 'Submit' : 'Next');
  const resolvedIsPrevDisabled = isPrevDisabled ?? activePart === 1;

  return (
    <div className="min-h-screen bg-white text-stone-950">
      <WritingTestHeader
        isPrimaryActionDisabled={isPrimaryActionDisabled}
        isPrevDisabled={resolvedIsPrevDisabled}
        isReview={isReview}
        onLogoClick={onLogoClick}
        onPrevPart={onPrevPart}
        onPrimaryAction={onPrimaryAction}
        onTextSizeChange={onTextSizeChange}
        prevActionLabel={prevActionLabel}
        primaryActionLabel={primaryActionLabel}
        textSize={textSize}
        timeLeftSeconds={timeLeftSeconds}
      />

      <main className="mx-auto max-w-345 px-4 py-6 pb-32 md:pb-28">{children}</main>

      <WritingTestFooter
        activePart={activePart}
        answers={answers}
        isPrimaryActionDisabled={isPrimaryActionDisabled}
        isPrevDisabled={resolvedIsPrevDisabled}
        onPrimaryAction={onPrimaryAction}
        onPartChange={onPartChange}
        onPrevPart={onPrevPart}
        prevActionLabel={prevActionLabel}
        primaryActionLabel={primaryActionLabel}
        test={test}
      />
    </div>
  );
}
