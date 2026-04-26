export type PracticeSectionType = 'listening' | 'reading' | 'writing' | 'speaking' | 'mock-exam';

export type PracticeQuestionItem = {
  attemptCount: number;
  countLabel?: string;
  durationMinutes?: number;
  examId?: string;
  href: string;
  id: number;
  isCompleted?: boolean;
  isStartAvailable?: boolean;
  questionCount?: number;
  isStarred?: boolean;
  remoteId?: string;
  sectionType?: PracticeSectionType;
  statLabel?: string;
  tokenCost?: number;
  title: string;
};

export type PracticeOverviewSectionType = PracticeSectionType | 'favorites';

export type PracticeOverview = {
  avgBandScore?: number;
  savedCount: number;
  sectionType?: PracticeOverviewSectionType;
  sourceLabel: string;
  summaryLabel?: string;
  title: string;
  totalAttempting: number;
  totalQuestions: number;
  totalSolved: number;
  updatedAtLabel: string;
};
