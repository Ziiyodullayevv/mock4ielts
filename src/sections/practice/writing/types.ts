import type { PracticeTextSize } from '../shared/practice-text-size';

import {
  PRACTICE_TEXT_SIZE_MIN,
  PRACTICE_TEXT_SIZE_MAX,
  PRACTICE_TEXT_SIZE_DEFAULT,
} from '../shared/practice-text-size';

export type WritingQuestionType = 'graph_description' | 'essay';
export type WritingTextSize = PracticeTextSize;

export const WRITING_TEXT_SIZE_MIN = PRACTICE_TEXT_SIZE_MIN;
export const WRITING_TEXT_SIZE_MAX = PRACTICE_TEXT_SIZE_MAX;
export const WRITING_TEXT_SIZE_DEFAULT = PRACTICE_TEXT_SIZE_DEFAULT;
export const WRITING_OPEN_NOTES_EVENT = 'mock4ielts:writing-open-notes';

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
