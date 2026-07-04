'use client';

import { useContext, createContext } from 'react';

type QuestionNumberingValue = {
  nextNumber: number;
  currentQuestionOrder?: number;
};

const QuestionNumberingContext = createContext<QuestionNumberingValue>({
  nextNumber: 1,
});

export const QuestionNumberingProvider = QuestionNumberingContext.Provider;

export function useQuestionNumbering() {
  return useContext(QuestionNumberingContext);
}

function collectNumbers(value: unknown, numbers: number[]) {
  if (typeof value === 'string') {
    for (const match of value.matchAll(/___(\d+)___|<(?:b|strong)>\s*(\d+)\s*<\/(?:b|strong)>/g)) {
      const number = Number(match[1] ?? match[2]);
      if (Number.isFinite(number) && number > 0) numbers.push(number);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectNumbers(item, numbers));
    return;
  }

  if (!value || typeof value !== 'object') return;

  Object.entries(value).forEach(([key, item]) => {
    if (['order', 'id'].includes(key)) {
      const number = Number(item);
      if (Number.isFinite(number) && number > 0) numbers.push(number);
    }
    collectNumbers(item, numbers);
  });
}

export function getNextSectionQuestionNumber(parts: any[]) {
  const numbers: number[] = [];

  parts.forEach((part) => {
    (part?.questions || []).forEach((question: any) => {
      const order = Number(question?.order);
      const points = Math.max(Number(question?.points) || 1, 1);

      if (Number.isFinite(order) && order > 0) {
        numbers.push(order + points - 1);
      }

      if (
        question?.correct_answer &&
        typeof question.correct_answer === 'object' &&
        !Array.isArray(question.correct_answer)
      ) {
        Object.keys(question.correct_answer).forEach((key) => {
          const number = Number(key);
          if (Number.isFinite(number) && number > 0) numbers.push(number);
        });
      }

      collectNumbers(question?.correct_answer, numbers);
      collectNumbers(question?.metadata, numbers);
    });
  });

  return numbers.length ? Math.max(...numbers) + 1 : 1;
}

export function getQuestionDisplayNumbers(question: any) {
  const explicitNumbers: number[] = [];
  const order = Number(question?.order);
  const points = Math.max(Number(question?.points) || 1, 1);

  if (
    question?.correct_answer &&
    typeof question.correct_answer === 'object' &&
    !Array.isArray(question.correct_answer)
  ) {
    Object.keys(question.correct_answer).forEach((key) => {
      const number = Number(key);
      if (Number.isFinite(number) && number > 0) explicitNumbers.push(number);
    });
  }

  collectNumbers(question?.metadata, explicitNumbers);

  if (explicitNumbers.length > 0) {
    return [...new Set(explicitNumbers)].sort((a, b) => a - b);
  }

  const numbers: number[] = [];
  if (Number.isFinite(order) && order > 0) {
    for (let number = order; number < order + points; number += 1) {
      numbers.push(number);
    }
  }

  return [...new Set(numbers)].sort((a, b) => a - b);
}

export function formatQuestionNumbers(numbers: number[]) {
  if (numbers.length === 0) return 'Question';
  if (numbers.length === 1) return `Question ${numbers[0]}`;

  const groups: string[] = [];
  let start = numbers[0];
  let end = numbers[0];

  for (let index = 1; index < numbers.length; index += 1) {
    if (numbers[index] === end + 1) {
      end = numbers[index];
      continue;
    }

    groups.push(start === end ? String(start) : `${start}–${end}`);
    start = numbers[index];
    end = numbers[index];
  }

  groups.push(start === end ? String(start) : `${start}–${end}`);
  return `Questions ${groups.join(', ')}`;
}
