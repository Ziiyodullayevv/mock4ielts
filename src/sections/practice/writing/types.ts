export type WritingQuestionType = 'graph_description' | 'essay';

export type WritingTask = {
  id: string;
  imageUrl?: string;
  instructions: string;
  modelAnswer?: string;
  number: number;
  prompt: string;
  questionType: WritingQuestionType;
  timeRecommendedMinutes?: number;
  wordLimitMin: number;
};

export type WritingPart = {
  number: number;
  task: WritingTask;
  title: string;
};

export type WritingTest = {
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  durationMinutes: number;
  id: string;
  parts: WritingPart[];
  title: string;
};

export type WritingAnswers = Record<string, string>;

export type WritingTestResult = {
  answers: WritingAnswers;
  timeSpentSeconds?: number;
};
