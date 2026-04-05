import type { Answers, ListeningTest } from '../../sections/practice/listening/types';

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
  onPartChange: (part: ListeningPartNumber) => void;
  onPrevPart: () => void;
  onPrimaryAction: () => void;
  onQuestionSelect: (part: ListeningPartNumber, questionId: string) => void;
  primaryActionLabelOverride?: string;
  prevActionLabel?: string;
  test: ListeningTest;
  timeLeftSeconds: number;
};
