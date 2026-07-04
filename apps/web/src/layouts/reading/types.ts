import type { Answers , ReadingTest } from '@/src/sections/practice/reading/types';
import type { PracticeTextSize } from '@/src/sections/practice/shared/practice-text-size';

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
  onTextSizeChange: (textSize: PracticeTextSize) => void;
  primaryActionLabelOverride?: string;
  prevActionLabel?: string;
  test: ReadingTest;
  textSize: PracticeTextSize;
  timeLeftSeconds: number;
};
