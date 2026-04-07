import type { WritingTest, WritingAnswers } from '@/src/sections/practice/writing/types';

export type WritingPartNumber = number;

export type WritingTestLayoutProps = {
  activePart: WritingPartNumber;
  answers: WritingAnswers;
  children: React.ReactNode;
  isPrimaryActionDisabled?: boolean;
  isPrevDisabled?: boolean;
  isReview?: boolean;
  onLogoClick?: () => void;
  onPartChange: (part: WritingPartNumber) => void;
  onPrevPart: () => void;
  onPrimaryAction: () => void;
  primaryActionLabelOverride?: string;
  prevActionLabel?: string;
  test: WritingTest;
  timeLeftSeconds: number;
};
