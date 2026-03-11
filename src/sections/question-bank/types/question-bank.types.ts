export type QuestionBankSkill = 'Listening' | 'Reading' | 'Speaking' | 'Writing';

export type QuestionBankItem = {
  attemptCount?: number;
  bandScore?: number;
  completionRate: number;
  href: string;
  id: number;
  isCompleted?: boolean;
  isLocked?: boolean;
  isStarred?: boolean;
  tokenCost?: number;
  skill: QuestionBankSkill;
  subtitle: string;
  title: string;
};

export type QuestionBankTemplateCard = {
  badge?: string;
  id: string;
  poster: string;
  title: string;
  video: string;
};
