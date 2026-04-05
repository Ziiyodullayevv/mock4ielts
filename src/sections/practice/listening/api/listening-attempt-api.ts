import type { Answers, TestResult, ListeningTest, CorrectAnswer } from '../types';

import axios from 'axios';
import { endpoints, axiosInstance } from '@/src/lib/axios';

import { computeResult } from '../utils';

type ApiRecord = Record<string, unknown>;

type SubmitPayload = {
  answers: Array<{
    answer: unknown;
    question_id: string;
  }>;
  attempt_id: string;
};

type ListeningQuestionResult = {
  correctAnswer?: unknown;
  explanation?: string;
  isCorrect?: boolean;
  questionId: string;
  score?: number;
  userAnswer?: unknown;
};

export type SubmitResult = {
  result: TestResult;
  reviewTest: ListeningTest;
};

const asArray = (value: unknown) => (Array.isArray(value) ? value : []);

const asRecord = (value: unknown): ApiRecord | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as ApiRecord) : null;

const pickBoolean = (value: unknown) => (typeof value === 'boolean' ? value : undefined);

const pickNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const pickString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string') {
      const normalizedValue = value.trim();

      if (normalizedValue.length) {
        return normalizedValue;
      }
    }
  }

  return undefined;
};

const toCorrectAnswer = (value: unknown): CorrectAnswer | undefined => {
  const singleValue = pickString(value);

  if (singleValue) {
    return singleValue;
  }

  const values = asArray(value)
    .map((item) => pickString(item))
    .filter((item): item is string => Boolean(item));

  if (values.length) {
    return values;
  }

  return undefined;
};

const toAnswerString = (value: unknown) => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
};

const toMultiSelectAnswer = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => toAnswerString(item))
      .filter((item): item is string => typeof item === 'string')
      .join(',');
  }

  return toAnswerString(value);
};

const toQuestionResult = (value: unknown): ListeningQuestionResult | null => {
  const record = asRecord(value);

  if (!record) {
    return null;
  }

  const questionId = pickString(record.question_id, record.id);

  if (!questionId) {
    return null;
  }

  return {
    correctAnswer: record.correct_answer ?? record.correctAnswer,
    explanation: pickString(record.explanation),
    isCorrect: pickBoolean(record.is_correct ?? record.isCorrect),
    questionId,
    score: pickNumber(record.score),
    userAnswer:
      record.user_answer ??
      record.userAnswer ??
      (record.correct_answer == null && record.correctAnswer == null ? record.answer : undefined),
  };
};

const collectQuestionResults = (value: unknown): ListeningQuestionResult[] => {
  const root = asRecord(value) ?? {};
  const data = asRecord(root.data) ?? root;
  const directCollections = [
    data.answers,
    data.results,
    data.question_results,
    data.questions,
  ];

  const nestedParts = asArray(data.parts).flatMap((part) => {
    const record = asRecord(part) ?? {};

    return [record.answers, record.results, record.question_results, record.questions];
  });

  return [...directCollections, ...nestedParts]
    .flatMap((collection) => asArray(collection))
    .map(toQuestionResult)
    .filter((result): result is ListeningQuestionResult => result !== null);
};

const parseAttemptId = (payload: unknown) => {
  const root = asRecord(payload) ?? {};
  const data = asRecord(root.data) ?? root;

  return pickString(data.attempt_id, root.attempt_id);
};

const parseOverallBand = (payload: unknown) => {
  const root = asRecord(payload) ?? {};
  const data = asRecord(root.data) ?? root;

  return pickNumber(data.overall_band) ?? pickNumber(data.band_score) ?? pickNumber(data.band);
};

const parseTimeSpentSeconds = (payload: unknown) => {
  const root = asRecord(payload) ?? {};
  const data = asRecord(root.data) ?? root;

  return pickNumber(data.time_spent_seconds) ?? pickNumber(data.duration_seconds) ?? null;
};

const parseScore = (payload: unknown) => {
  const root = asRecord(payload) ?? {};
  const data = asRecord(root.data) ?? root;

  return (
    pickNumber(data.score) ??
    pickNumber(data.correct_count) ??
    pickNumber(data.correct_answers) ??
    pickNumber(data.total_score)
  );
};

const parseTotal = (payload: unknown) => {
  const root = asRecord(payload) ?? {};
  const data = asRecord(root.data) ?? root;

  return pickNumber(data.total) ?? pickNumber(data.total_questions) ?? pickNumber(data.max_score);
};

const setCorrectAnswerForResult = (
  resultMap: Map<string, ListeningQuestionResult>,
  backendQuestionId: string | undefined,
  targetNumber: number
) => {
  if (!backendQuestionId) {
    return undefined;
  }

  const result = resultMap.get(backendQuestionId);

  if (!result) {
    return undefined;
  }

  const correctAnswerRecord = asRecord(result.correctAnswer);

  if (correctAnswerRecord) {
    return toCorrectAnswer(correctAnswerRecord[String(targetNumber)]);
  }

  return toCorrectAnswer(result.correctAnswer);
};

const cloneTest = (test: ListeningTest): ListeningTest =>
  JSON.parse(JSON.stringify(test)) as ListeningTest;

const getUserAnswerForResult = (
  resultMap: Map<string, ListeningQuestionResult>,
  backendQuestionId: string | undefined,
  targetNumber?: number,
  multiSelect?: boolean
) => {
  if (!backendQuestionId) {
    return undefined;
  }

  const result = resultMap.get(backendQuestionId);

  if (!result) {
    return undefined;
  }

  if (multiSelect) {
    return toMultiSelectAnswer(result.userAnswer);
  }

  const userAnswerRecord = asRecord(result.userAnswer);

  if (userAnswerRecord && typeof targetNumber === 'number') {
    return toAnswerString(userAnswerRecord[String(targetNumber)]);
  }

  return toAnswerString(result.userAnswer);
};

const buildAnswersFromQuestionResults = (
  test: ListeningTest,
  questionResults: ListeningQuestionResult[]
): Answers => {
  const answers: Answers = {};
  const resultMap = new Map(questionResults.map((result) => [result.questionId, result]));

  for (const part of test.parts) {
    for (const group of part.groups) {
      if (group.type === 'multiple-choice') {
        group.questions.forEach((question) => {
          const userAnswer = getUserAnswerForResult(
            resultMap,
            question.backendQuestionId,
            question.number,
            question.multiSelect
          );

          if (typeof userAnswer === 'string') {
            answers[question.id] = userAnswer;
          }
        });

        continue;
      }

      if (group.type === 'matching') {
        group.data.pairs.forEach((pair) => {
          const userAnswer = getUserAnswerForResult(
            resultMap,
            pair.backendQuestionId,
            pair.number
          );

          if (typeof userAnswer === 'string') {
            answers[pair.id] = userAnswer;
          }
        });

        continue;
      }

      if (group.type === 'form-completion') {
        group.sections.forEach((section) => {
          section.fields.forEach((field) => {
            const userAnswer = getUserAnswerForResult(
              resultMap,
              field.backendQuestionId,
              field.number
            );

            if (typeof userAnswer === 'string') {
              answers[field.id] = userAnswer;
            }
          });
        });

        continue;
      }

      if (group.type === 'note-completion') {
        group.sections.forEach((section) => {
          section.bullets.forEach((bullet) => {
            if (!bullet.field) {
              return;
            }

            const userAnswer = getUserAnswerForResult(
              resultMap,
              bullet.field.backendQuestionId,
              bullet.field.number
            );

            if (typeof userAnswer === 'string') {
              answers[bullet.field.id] = userAnswer;
            }
          });
        });

        continue;
      }

      if (group.type === 'table-completion') {
        const rows = [
          ...(group.data.rows ?? []),
          ...(group.data.sections?.flatMap((section) => section.rows) ?? []),
        ];

        rows.forEach((row) => {
          row.forEach((cell) => {
            if (cell.isBlank && cell.id) {
              const userAnswer = getUserAnswerForResult(
                resultMap,
                cell.backendQuestionId,
                cell.number
              );

              if (typeof userAnswer === 'string') {
                answers[cell.id] = userAnswer;
              }
            }

            (cell.segments ?? []).forEach((segment) => {
              if (segment.type !== 'blank') {
                return;
              }

              const userAnswer = getUserAnswerForResult(
                resultMap,
                segment.field.backendQuestionId,
                segment.field.number
              );

              if (typeof userAnswer === 'string') {
                answers[segment.field.id] = userAnswer;
              }
            });
          });
        });

        continue;
      }

      if (group.type === 'flow-chart') {
        group.steps.forEach((step) => {
          if (!step.isBlank || !step.id) {
            return;
          }

          const userAnswer = getUserAnswerForResult(
            resultMap,
            step.backendQuestionId,
            step.number
          );

          if (typeof userAnswer === 'string') {
            answers[step.id] = userAnswer;
          }
        });

        continue;
      }

      if (group.type === 'sentence-completion' || group.type === 'short-answer') {
        group.questions.forEach((question) => {
          const userAnswer = getUserAnswerForResult(
            resultMap,
            question.backendQuestionId,
            question.number
          );

          if (typeof userAnswer === 'string') {
            answers[question.id] = userAnswer;
          }
        });

        continue;
      }

      if (group.type === 'map-labelling') {
        group.data.pins.forEach((pin) => {
          const userAnswer = getUserAnswerForResult(
            resultMap,
            pin.backendQuestionId,
            pin.number
          );

          if (typeof userAnswer === 'string') {
            answers[pin.id] = userAnswer;
          }
        });

        continue;
      }

      if (group.type === 'diagram-completion') {
        group.data.questions.forEach((question) => {
          const userAnswer = getUserAnswerForResult(
            resultMap,
            question.backendQuestionId,
            question.number
          );

          if (typeof userAnswer === 'string') {
            answers[question.id] = userAnswer;
          }
        });

        continue;
      }

      if (group.type === 'summary-completion') {
        group.paragraphs.forEach((paragraph) => {
          paragraph.segments.forEach((segment) => {
            if (segment.type !== 'blank') {
              return;
            }

            const userAnswer = getUserAnswerForResult(
              resultMap,
              segment.field.backendQuestionId,
              segment.field.number
            );

            if (typeof userAnswer === 'string') {
              answers[segment.field.id] = userAnswer;
            }
          });
        });
      }
    }
  }

  return answers;
};

const applyQuestionResultsToTest = (
  test: ListeningTest,
  questionResults: ListeningQuestionResult[]
): ListeningTest => {
  const nextTest = cloneTest(test);
  const resultMap = new Map(questionResults.map((result) => [result.questionId, result]));

  for (const part of nextTest.parts) {
    for (const group of part.groups) {
      if (group.type === 'multiple-choice') {
        group.questions = group.questions.map((question) => {
          const result = resultMap.get(question.backendQuestionId ?? '');

          if (!result) {
            return question;
          }

          const correctAnswer = toCorrectAnswer(result.correctAnswer);

          if (!correctAnswer) {
            return question;
          }

          return {
            ...question,
            answer: Array.isArray(correctAnswer) ? correctAnswer.join(',') : correctAnswer,
          };
        });

        continue;
      }

      if (group.type === 'matching') {
        group.data.pairs = group.data.pairs.map((pair) => ({
          ...pair,
          answer: setCorrectAnswerForResult(resultMap, pair.backendQuestionId, pair.number) ?? pair.answer,
        }));

        continue;
      }

      if (group.type === 'form-completion') {
        group.sections = group.sections.map((section) => ({
          ...section,
          fields: section.fields.map((field) => ({
            ...field,
            answer: setCorrectAnswerForResult(resultMap, field.backendQuestionId, field.number) ?? field.answer,
          })),
        }));

        continue;
      }

      if (group.type === 'note-completion') {
        group.sections = group.sections.map((section) => ({
          ...section,
          bullets: section.bullets.map((bullet) =>
            bullet.field
              ? {
                  ...bullet,
                  field: {
                    ...bullet.field,
                    answer:
                      setCorrectAnswerForResult(
                        resultMap,
                        bullet.field.backendQuestionId,
                        bullet.field.number
                      ) ?? bullet.field.answer,
                  },
                }
              : bullet
          ),
        }));

        continue;
      }

      if (group.type === 'table-completion') {
        const applyCells = (rows: typeof group.data.rows) =>
          rows?.map((row) =>
            row.map((cell) => ({
              ...cell,
              answer:
                cell.isBlank && cell.number
                  ? setCorrectAnswerForResult(resultMap, cell.backendQuestionId, cell.number) ?? cell.answer
                  : cell.answer,
              segments: cell.segments?.map((segment) =>
                segment.type === 'blank'
                  ? {
                      ...segment,
                      field: {
                        ...segment.field,
                        answer:
                          setCorrectAnswerForResult(
                            resultMap,
                            segment.field.backendQuestionId,
                            segment.field.number
                          ) ?? segment.field.answer,
                      },
                    }
                  : segment
              ),
            }))
          );

        group.data.rows = applyCells(group.data.rows);
        group.data.sections = group.data.sections?.map((section) => ({
          ...section,
          rows: applyCells(section.rows) ?? [],
        }));

        continue;
      }

      if (group.type === 'flow-chart') {
        group.steps = group.steps.map((step) => ({
          ...step,
          answer:
            step.isBlank && step.number
              ? setCorrectAnswerForResult(resultMap, step.backendQuestionId, step.number) ?? step.answer
              : step.answer,
        }));

        continue;
      }

      if (group.type === 'sentence-completion' || group.type === 'short-answer') {
        group.questions = group.questions.map((question) => ({
          ...question,
          answer:
            setCorrectAnswerForResult(resultMap, question.backendQuestionId, question.number) ?? question.answer,
        }));

        continue;
      }

      if (group.type === 'map-labelling') {
        group.data.pins = group.data.pins.map((pin) => ({
          ...pin,
          answer: setCorrectAnswerForResult(resultMap, pin.backendQuestionId, pin.number) ?? pin.answer,
        }));

        continue;
      }

      if (group.type === 'diagram-completion') {
        group.data.questions = group.data.questions.map((question) => ({
          ...question,
          answer:
            setCorrectAnswerForResult(resultMap, question.backendQuestionId, question.number) ?? question.answer,
        }));

        continue;
      }

      if (group.type === 'summary-completion') {
        group.paragraphs = group.paragraphs.map((paragraph) => ({
          ...paragraph,
          segments: paragraph.segments.map((segment) =>
            segment.type === 'blank'
              ? {
                  ...segment,
                  field: {
                    ...segment.field,
                    answer:
                      setCorrectAnswerForResult(
                        resultMap,
                        segment.field.backendQuestionId,
                        segment.field.number
                      ) ?? segment.field.answer,
                  },
                }
              : segment
          ),
        }));
      }
    }
  }

  return nextTest;
};

const collectCompletionAnswerMap = (
  fields: Array<{
    backendQuestionId?: string;
    id: string;
    number: number;
  }>,
  answers: Answers
) => {
  const grouped = new Map<string, Record<string, string>>();

  for (const field of fields) {
    if (!field.backendQuestionId) {
      continue;
    }

    const currentGroup = grouped.get(field.backendQuestionId) ?? {};
    currentGroup[String(field.number)] = answers[field.id] ?? '';
    grouped.set(field.backendQuestionId, currentGroup);
  }

  return grouped;
};

export function buildListeningSubmitPayload(test: ListeningTest, answers: Answers, attemptId: string): SubmitPayload {
  const answerEntries = new Map<string, unknown>();

  for (const part of test.parts) {
    for (const group of part.groups) {
      if (group.type === 'multiple-choice') {
        group.questions.forEach((question) => {
          if (!question.backendQuestionId) {
            return;
          }

          const value = answers[question.id] ?? '';

          answerEntries.set(
            question.backendQuestionId,
            question.multiSelect
              ? value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean)
              : value
          );
        });
        continue;
      }

      if (group.type === 'matching') {
        const grouped = collectCompletionAnswerMap(
          group.data.pairs.map((pair) => ({
            backendQuestionId: pair.backendQuestionId,
            id: pair.id,
            number: pair.number,
          })),
          answers
        );

        grouped.forEach((value, questionId) => answerEntries.set(questionId, value));
        continue;
      }

      if (group.type === 'form-completion') {
        const grouped = collectCompletionAnswerMap(
          group.sections.flatMap((section) => section.fields),
          answers
        );

        grouped.forEach((value, questionId) => answerEntries.set(questionId, value));
        continue;
      }

      if (group.type === 'note-completion') {
        const grouped = collectCompletionAnswerMap(
          group.sections.flatMap((section) =>
            section.bullets
              .filter((bullet) => bullet.field)
              .map((bullet) => bullet.field!)
          ),
          answers
        );

        grouped.forEach((value, questionId) => answerEntries.set(questionId, value));
        continue;
      }

      if (group.type === 'table-completion') {
        const fields = [
          ...(group.data.rows ?? []).flatMap((row) =>
            row.flatMap((cell) => [
              ...(cell.isBlank && cell.id && cell.number
                ? [{ backendQuestionId: cell.backendQuestionId, id: cell.id, number: cell.number }]
                : []),
              ...(cell.segments
                ?.filter((segment) => segment.type === 'blank')
                .map((segment) => ({
                  backendQuestionId: segment.field.backendQuestionId,
                  id: segment.field.id,
                  number: segment.field.number,
                })) ?? []),
            ])
          ),
          ...(group.data.sections?.flatMap((section) =>
            section.rows.flatMap((row) =>
              row.flatMap((cell) => [
                ...(cell.isBlank && cell.id && cell.number
                  ? [{ backendQuestionId: cell.backendQuestionId, id: cell.id, number: cell.number }]
                  : []),
                ...(cell.segments
                  ?.filter((segment) => segment.type === 'blank')
                  .map((segment) => ({
                    backendQuestionId: segment.field.backendQuestionId,
                    id: segment.field.id,
                    number: segment.field.number,
                  })) ?? []),
              ])
            )
          ) ?? []),
        ];

        const grouped = collectCompletionAnswerMap(fields, answers);
        grouped.forEach((value, questionId) => answerEntries.set(questionId, value));
        continue;
      }

      if (group.type === 'flow-chart') {
        const grouped = collectCompletionAnswerMap(
          group.steps
            .filter((step) => step.isBlank && step.id && step.number)
            .map((step) => ({
              backendQuestionId: step.backendQuestionId,
              id: step.id!,
              number: step.number!,
            })),
          answers
        );

        grouped.forEach((value, questionId) => answerEntries.set(questionId, value));
        continue;
      }

      if (group.type === 'sentence-completion' || group.type === 'short-answer') {
        const grouped = collectCompletionAnswerMap(group.questions, answers);
        grouped.forEach((value, questionId) => answerEntries.set(questionId, value));
        continue;
      }

      if (group.type === 'map-labelling') {
        const grouped = collectCompletionAnswerMap(group.data.pins, answers);
        grouped.forEach((value, questionId) => answerEntries.set(questionId, value));
        continue;
      }

      if (group.type === 'diagram-completion') {
        const grouped = collectCompletionAnswerMap(group.data.questions, answers);
        grouped.forEach((value, questionId) => answerEntries.set(questionId, value));
        continue;
      }

      if (group.type === 'summary-completion') {
        const grouped = collectCompletionAnswerMap(
          group.paragraphs.flatMap((paragraph) =>
            paragraph.segments
              .filter((segment) => segment.type === 'blank')
              .map((segment) => segment.field)
          ),
          answers
        );

        grouped.forEach((value, questionId) => answerEntries.set(questionId, value));
      }
    }
  }

  return {
    answers: [...answerEntries.entries()].map(([questionId, answer]) => ({
      answer,
      question_id: questionId,
    })),
    attempt_id: attemptId,
  };
}

const buildBackendResult = (
  test: ListeningTest,
  payload: unknown,
  attemptId: string,
  answers?: Answers
): SubmitResult => {
  const questionResults = collectQuestionResults(payload);
  const resolvedAnswers = answers ?? buildAnswersFromQuestionResults(test, questionResults);
  const reviewTest = applyQuestionResultsToTest(test, questionResults);
  const computedResult = computeResult(reviewTest, resolvedAnswers);

  return {
    result: {
      ...computedResult,
      attemptId,
      overallBand: parseOverallBand(payload),
      score: parseScore(payload) ?? computedResult.score,
      source: 'backend',
      total: parseTotal(payload) ?? computedResult.total,
      timeSpentSeconds: parseTimeSpentSeconds(payload),
    },
    reviewTest,
  };
};

export async function startListeningSectionAttempt(sectionId: string) {
  const response = await axiosInstance.post(endpoints.sections.start(sectionId));
  const attemptId = parseAttemptId(response.data);

  if (!attemptId) {
    throw new Error('Start response did not include an attempt id.');
  }

  return {
    attemptId,
  };
}

export async function getListeningSectionResult(sectionId: string, attemptId: string) {
  const response = await axiosInstance.get(endpoints.sections.result(sectionId, attemptId));

  return response.data;
}

export async function getListeningSectionAttemptResult(params: {
  attemptId: string;
  sectionId: string;
  test: ListeningTest;
}): Promise<SubmitResult | null> {
  const { attemptId, sectionId, test } = params;

  try {
    const resultPayload = await getListeningSectionResult(sectionId, attemptId);

    return buildBackendResult(test, resultPayload, attemptId);
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

export async function submitListeningSectionAttempt(params: {
  answers: Answers;
  attemptId: string;
  sectionId: string;
  test: ListeningTest;
}): Promise<SubmitResult> {
  const { answers, attemptId, sectionId, test } = params;
  const payload = buildListeningSubmitPayload(test, answers, attemptId);
  const submitResponse = await axiosInstance.post(endpoints.sections.submit(sectionId), payload);

  try {
    const resultPayload = await getListeningSectionResult(sectionId, attemptId);

    return buildBackendResult(test, resultPayload, attemptId, answers);
  } catch {
    return buildBackendResult(test, submitResponse.data, attemptId, answers);
  }
}
