'use client';

import type { WritingTestLayoutProps } from './types';

import { PracticeShell } from '@/src/layouts/practice';

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
    <PracticeShell
      rootClassName="bg-background text-foreground"
      mainClassName="max-w-345"
      header={
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
      }
      footer={
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
      }
    >
      {children}
    </PracticeShell>
  );
}
