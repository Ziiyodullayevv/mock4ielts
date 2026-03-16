export type PracticeQuestionItem = {
  attemptCount: number;
  href: string;
  id: number;
  isCompleted?: boolean;
  isStarred?: boolean;
  tokenCost?: number;
  title: string;
};

export type PracticeOverview = {
  avgBandScore?: number;
  savedCount: number;
  sourceLabel: string;
  title: string;
  totalAttempting: number;
  totalQuestions: number;
  totalSolved: number;
  updatedAtLabel: string;
};
