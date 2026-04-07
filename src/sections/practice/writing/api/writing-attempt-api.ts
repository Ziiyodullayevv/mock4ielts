import type { WritingTest, WritingAnswers, WritingTestResult } from '../types';

import axios from 'axios';
import { endpoints, axiosInstance } from '@/src/lib/axios';

import { startListeningSectionAttempt } from '../../listening/api/listening-attempt-api';

export const startWritingSectionAttempt = startListeningSectionAttempt;

type SubmitResult = {
  result: WritingTestResult;
};

function buildAnswersFromPayload(payload: unknown): WritingAnswers {
  const answers: WritingAnswers = {};

  const tryExtractAnswers = (data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const obj = data as Record<string, unknown>;

    if (Array.isArray(obj.answers)) {
      for (const item of obj.answers) {
        if (item && typeof item === 'object') {
          const entry = item as Record<string, unknown>;
          const id = typeof entry.question_id === 'string' ? entry.question_id : null;
          const answer = typeof entry.answer === 'string' ? entry.answer : '';
          if (id) answers[id] = answer;
        }
      }
    }

    // Try nested data key
    if (obj.data) tryExtractAnswers(obj.data);
  };

  tryExtractAnswers(payload);
  return answers;
}

export async function getWritingSectionAttemptResult(params: {
  attemptId: string;
  sectionId: string;
}): Promise<SubmitResult | null> {
  const { attemptId, sectionId } = params;

  try {
    const response = await axiosInstance.get(endpoints.sections.result(sectionId, attemptId));
    const answers = buildAnswersFromPayload(response.data);

    return {
      result: {
        answers,
        timeSpentSeconds: undefined,
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 400 || status === 404 || status === 409 || status === 422) {
        return null;
      }
    }
    throw error;
  }
}

export async function submitWritingSectionAttempt(params: {
  answers: WritingAnswers;
  attemptId: string;
  sectionId: string;
  test: WritingTest;
}): Promise<SubmitResult> {
  const { answers, attemptId, sectionId, test } = params;

  const payload = {
    answers: test.parts.map((part) => ({
      answer: answers[part.task.id] ?? '',
      question_id: part.task.id,
    })),
    attempt_id: attemptId,
  };

  await axiosInstance.post(endpoints.sections.submit(sectionId), payload);

  return {
    result: {
      answers,
      timeSpentSeconds: undefined,
    },
  };
}
