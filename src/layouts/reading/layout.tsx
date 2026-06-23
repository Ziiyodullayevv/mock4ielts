'use client';

import type { ReadingTestLayoutProps } from './types';

import {
  PracticeShell } from '@/src/layouts/practice';

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
  onTextSizeChange,
  primaryActionLabelOverride,
  prevActionLabel,
  test,
  textSize,
  timeLeftSeconds,
}: ReadingTestLayoutProps) {
  const isLastPart = activePart === test.parts.length;
  const primaryActionLabel =
    primaryActionLabelOverride ?? (isReview ? 'Retry' : isLastPart ? 'Submit' : 'Next');
  const resolvedIsPrevDisabled = isPrevDisabled ?? activePart === 1;

  return (
    <PracticeShell
      rootClassName="bg-background text-foreground lg:h-svh lg:overflow-hidden"
      mainClassName="w-full max-w-none pt-0 pb-28 sm:pb-4 lg:box-border lg:h-[calc(100svh-4.5rem)] lg:min-h-0 lg:overflow-hidden lg:px-4 lg:pb-4 lg:pt-2"
      header={
        <ReadingTestHeader
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
      }
    >
      {children}
    </PracticeShell>
  );
}
