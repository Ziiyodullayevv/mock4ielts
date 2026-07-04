import type {
  WritingTest,
  WritingAnswers,
  WritingTextSize,
} from '@/src/sections/practice/writing/types';

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
  onTextSizeChange: (textSize: WritingTextSize) => void;
  primaryActionLabelOverride?: string;
  prevActionLabel?: string;
  test: WritingTest;
  textSize: WritingTextSize;
  timeLeftSeconds: number;
};
