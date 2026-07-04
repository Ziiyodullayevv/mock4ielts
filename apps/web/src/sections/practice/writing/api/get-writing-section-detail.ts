import type { WritingTest, WritingQuestionType } from '../types';

import { CONFIG } from '@/src/global-config';
import { endpoints, axiosInstance } from '@/src/lib/axios';

type ApiRecord = Record<string, unknown>;

const asArray = (value: unknown) => (Array.isArray(value) ? value : []);

const asRecord = (value: unknown): ApiRecord | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as ApiRecord) : null;

const pickString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (normalized.length) return normalized;
  }
  return undefined;
};

const pickNumber = (...values: unknown[]) =>
  values.find((v): v is number => typeof v === 'number' && Number.isFinite(v));

const stripHtmlToText = (value: unknown) => {
  const html = pickString(value);

  if (!html) {
    return undefined;
  }

  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h\d|li)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .split(/\n{2,}/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n\n');
};

const normalizeMediaUrl = (value: unknown) => {
  const rawValue = pickString(value);
  if (!rawValue) return undefined;
  if (/^(https?:|data:|blob:)/i.test(rawValue)) return rawValue;
  const serverUrl = CONFIG.serverUrl.trim();
  if (!serverUrl) return rawValue;
  try {
    const normalizedPath = rawValue.startsWith('/') ? rawValue : `/${rawValue}`;
    return new URL(normalizedPath, serverUrl).toString();
  } catch {
    return rawValue;
  }
};

const toDifficulty = (value?: string): WritingTest['difficulty'] => {
  if (value === 'easy' || value === 'medium' || value === 'hard') return value;
  return 'medium';
};

export async function getWritingSectionDetail(sectionId: string): Promise<WritingTest> {
  const response = await axiosInstance.get(endpoints.sections.details(sectionId));
  const root = asRecord(response.data) ?? {};
  const data = (asRecord(root.data) ?? root) as ApiRecord;

  const parts = asArray(data.parts)
    .map((part, index) => {
      const record = asRecord(part) ?? {};
      const questions = asArray(record.questions);
      const firstQuestion = asRecord(questions[0]) ?? {};
      const metadata = asRecord(firstQuestion.metadata) ?? {};
      const questionType = pickString(
        firstQuestion.question_type,
        firstQuestion.questionType,
        metadata.task_type,
        metadata.taskType
      );
      const normalizedType: WritingQuestionType =
        ['graph_description', 'task_1_academic'].includes(
          questionType?.toLowerCase().replace(/-/g, '_') ?? ''
        )
          ? 'graph_description'
          : 'essay';

      const backendQuestionId =
        pickString(firstQuestion.id) ?? `${sectionId}-writing-${index + 1}`;
      const instructionHtml = pickString(metadata.instruction_html, metadata.instructionHtml);
      const promptText =
        pickString(firstQuestion.text) ?? stripHtmlToText(instructionHtml) ?? '';

      return {
        number: index + 1,
        task: {
          id: backendQuestionId,
          imageUrl: normalizeMediaUrl(firstQuestion.image_url ?? firstQuestion.imageUrl),
          instructions:
            pickString(record.instructions) ??
            (index === 0
              ? 'You should spend about 20 minutes on this task. Write at least 150 words.'
              : 'You should spend about 40 minutes on this task. Write at least 250 words.'),
          modelAnswer: pickString(metadata.model_answer, metadata.modelAnswer),
          number: index + 1,
          prompt: promptText,
          promptHtml: instructionHtml,
          questionType: normalizedType,
          timeRecommendedMinutes: pickNumber(
            metadata.time_recommended_minutes,
            metadata.timeRecommendedMinutes,
            metadata.recommended_minutes,
            metadata.recommendedMinutes
          ),
          wordLimitMin:
            pickNumber(
              metadata.word_limit_min,
              metadata.wordLimitMin,
              metadata.min_words,
              metadata.minWords
            ) ??
            (index === 0 ? 150 : 250),
        },
        title: pickString(record.title) ?? `Task ${index + 1}`,
      };
    })
    .filter((part) => Boolean(part.task.prompt));

  return {
    description:
      pickString(data.instructions) ?? 'You will have 1 hour to complete both tasks.',
    difficulty: toDifficulty(pickString(data.difficulty as string)),
    durationMinutes: pickNumber(data.duration_minutes, data.durationMinutes) ?? 60,
    id: (data.id as string) ?? sectionId,
    parts,
    title: pickString(data.title) ?? 'Academic Writing',
  };
}
