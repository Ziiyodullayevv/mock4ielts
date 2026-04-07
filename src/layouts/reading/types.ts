import type { Answers , ReadingTest } from '@/src/sections/practice/reading/types';

export type ReadingPartNumber = number;

export type ReadingTestLayoutProps = {
  activePart: ReadingPartNumber;
  activeQuestionId: string | null;
  answers: Answers;
  children: React.ReactNode;
  isPrimaryActionDisabled?: boolean;
  isPrevDisabled?: boolean;
  isReview?: boolean;
  onLogoClick?: () => void;
  onPartChange: (part: ReadingPartNumber) => void;
  onPrevPart: () => void;
  onPrimaryAction: () => void;
  onQuestionSelect: (part: ReadingPartNumber, questionId: string) => void;
  primaryActionLabelOverride?: string;
  prevActionLabel?: string;
  test: ReadingTest;
  timeLeftSeconds: number;
};
