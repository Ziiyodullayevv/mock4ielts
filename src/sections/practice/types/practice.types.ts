export type PracticeSectionType = 'listening' | 'reading' | 'writing' | 'speaking' | 'mock-exam';

export type PracticeQuestionItem = {
  attemptCount: number;
  countLabel?: string;
  durationMinutes?: number;
  href: string;
  id: number;
  isCompleted?: boolean;
  isStartAvailable?: boolean;
  questionCount?: number;
  isStarred?: boolean;
  sectionType?: PracticeSectionType;
  statLabel?: string;
  tokenCost?: number;
  title: string;
};

export type PracticeOverview = {
  avgBandScore?: number;
  savedCount: number;
  sectionType?: PracticeSectionType;
  sourceLabel: string;
  summaryLabel?: string;
  title: string;
  totalAttempting: number;
  totalQuestions: number;
  totalSolved: number;
  updatedAtLabel: string;
};
