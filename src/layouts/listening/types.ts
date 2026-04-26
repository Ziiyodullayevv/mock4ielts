import type { Answers, ListeningTest } from '../../sections/practice/listening/types';
import type { PracticeTextSize } from '../../sections/practice/shared/practice-text-size';

export type ListeningPartNumber = number;

export type ListeningTestLayoutProps = {
  activePart: ListeningPartNumber;
  activeQuestionId: string | null;
  audioUrl?: string;
  answers: Answers;
  children: React.ReactNode;
  isPrimaryActionDisabled?: boolean;
  isPrevDisabled?: boolean;
  isReview?: boolean;
  isSubmitAction?: boolean;
  onLogoClick?: () => void;
  onPartChange: (part: ListeningPartNumber) => void;
  onPrevPart: () => void;
  onPrimaryAction: () => void;
  onQuestionSelect: (part: ListeningPartNumber, questionId: string) => void;
  onTextSizeChange: (textSize: PracticeTextSize) => void;
  primaryActionLabelOverride?: string;
  prevActionLabel?: string;
  test: ListeningTest;
  textSize: PracticeTextSize;
  timeLeftSeconds: number;
};
