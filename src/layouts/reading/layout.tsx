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
      mainClassName="max-w-[1380px]"
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
