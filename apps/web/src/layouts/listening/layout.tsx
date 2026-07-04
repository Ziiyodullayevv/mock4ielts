'use client';

import type { ListeningTestLayoutProps } from './types';

import { PracticeShell } from '@/src/layouts/practice';

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
  isSubmitAction,
  onLogoClick,
  onPartChange,
  onPrevPart,
  onPrimaryAction,
  onAudioTimeChange,
  onQuestionSelect,
  onTextSizeChange,
  primaryActionLabelOverride,
  prevActionLabel,
  test,
  textSize,
  timeLeftSeconds,
}: ListeningTestLayoutProps) {
  const isLastPart = activePart === test.parts.length;
  const primaryActionLabel =
    primaryActionLabelOverride ?? (isReview ? 'Retry' : isLastPart ? 'Submit' : 'Next');
  const resolvedIsPrevDisabled = isPrevDisabled ?? activePart === 1;

  return (
    <PracticeShell
      mainClassName="max-w-[1000px]"
      header={
        <ListeningTestHeader
          audioUrl={audioUrl}
          isPrimaryActionDisabled={isPrimaryActionDisabled}
          isPrevDisabled={resolvedIsPrevDisabled}
          isReview={isReview}
          isSubmitAction={isSubmitAction ?? (!isReview && isLastPart)}
          onLogoClick={onLogoClick}
          onPrevPart={onPrevPart}
          onPrimaryAction={onPrimaryAction}
          onAudioTimeChange={onAudioTimeChange}
          onTextSizeChange={onTextSizeChange}
          prevActionLabel={prevActionLabel}
          primaryActionLabel={primaryActionLabel}
          textSize={textSize}
          timeLeftSeconds={timeLeftSeconds}
        />
      }
      footer={
        <ListeningTestFooter
          activePart={activePart}
          activeQuestionId={activeQuestionId}
          answers={answers}
          isReview={isReview}
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
