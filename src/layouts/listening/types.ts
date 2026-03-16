import type { Answers, ListeningTest } from '../../sections/practice/listening/types';

export type ListeningPartNumber = 1 | 2 | 3 | 4;

export type ListeningTestLayoutProps = {
  activePart: ListeningPartNumber;
  activeQuestionId: string | null;
  audioUrl?: string;
  answers: Answers;
  children: React.ReactNode;
  isReview?: boolean;
  onPartChange: (part: ListeningPartNumber) => void;
  onPrevPart: () => void;
  onPrimaryAction: () => void;
  onQuestionSelect: (part: ListeningPartNumber, questionId: string) => void;
  test: ListeningTest;
  timeLeftSeconds: number;
};
