'use client';

import { endpoints, axiosInstance } from '@/src/lib/axios';

type ApiRecord = Record<string, unknown>;
type PracticeSectionKey = 'listening' | 'reading' | 'writing' | 'speaking';

export type MyStatistics = {
  accuracyPercent?: number | null;
  correctAnswers?: number | null;
  listeningAvg?: number | null;
  overallAvg?: number | null;
  questionsAttempted?: number | null;
  readingAvg?: number | null;
  speakingAvg?: number | null;
  totalActiveTimeSeconds: number;
  totalSolved: number;
  totalSessions?: number | null;
  updatedAt?: string | null;
  writingAvg?: number | null;
};

export type MySectionStatisticsItem = {
  averageBand?: number | null;
  lastPracticedAt?: string | null;
  section: PracticeSectionKey;
  solvedCount: number;
};

export type MyExamStatistics = {
  averageOverallBand?: number | null;
  contestsParticipated: number;
  highestOverallBand?: number | null;
  totalMocksTaken: number;
  updatedAt?: string | null;
};

export type GlobalSectionStatisticsItem = {
  section: PracticeSectionKey;
  totalQuestions: number;
};

const asArray = (value: unknown) => (Array.isArray(value) ? value : []);

const asRecord = (value: unknown): ApiRecord | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as ApiRecord)
    : null;

const pickString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value !== 'string') continue;

    const normalizedValue = value.trim();

    if (normalizedValue) {
      return normalizedValue;
    }
  }

  return undefined;
};

const toNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsedValue = Number.parseFloat(value);

    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return undefined;
};

const toCount = (value: unknown) => {
  const parsedValue = toNumber(value);

  return parsedValue !== undefined ? Math.max(0, Math.round(parsedValue)) : 0;
};

const toBandNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value >= 0 && value <= 9.9 ? value : undefined;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue || trimmedValue.startsWith('-')) {
    return undefined;
  }

  const directValue = Number.parseFloat(trimmedValue);
  const digits = trimmedValue.replace(/[^\d]/g, '').replace(/^0+/, '');
  const isWeirdLongValue = digits.length > 4 || /^[+]?0{3,}/.test(trimmedValue);

  if (!isWeirdLongValue) {
    return Number.isFinite(directValue) && directValue >= 0 && directValue <= 9.9
      ? directValue
      : undefined;
  }

  if (!digits) {
    return 0;
  }

  const normalizedValue = digits.length === 1 ? digits : `${digits[0]}.${digits.slice(1)}`;
  const parsedValue = Number.parseFloat(normalizedValue);

  return Number.isFinite(parsedValue) && parsedValue >= 0 && parsedValue <= 9.9
    ? parsedValue
    : undefined;
};

const getDataRecord = (value: unknown) => {
  const root = asRecord(value) ?? {};

  return asRecord(root.data) ?? root;
};

const getDataArray = (value: unknown) => {
  const root = asRecord(value) ?? {};

  return Array.isArray(root.data) ? root.data : asArray(value);
};

const toSectionKey = (value: unknown): PracticeSectionKey | null => {
  const normalizedValue = pickString(value)?.toLowerCase().replace(/_/g, '-');

  if (normalizedValue === 'listening') return 'listening';
  if (normalizedValue === 'reading') return 'reading';
  if (normalizedValue === 'writing') return 'writing';
  if (normalizedValue === 'speaking') return 'speaking';

  return null;
};

export async function getMyStatistics(): Promise<MyStatistics> {
  const response = await axiosInstance.get(endpoints.statistics.me);
  const data = getDataRecord(response.data);

  return {
    accuracyPercent:
      toNumber(data.accuracy_percentage) ??
      toNumber(data.accuracy_percent) ??
      toNumber(data.overall_accuracy) ??
      null,
    correctAnswers:
      toNumber(data.correct_answers) ??
      toNumber(data.total_correct) ??
      toNumber(data.correct_count) ??
      null,
    listeningAvg: toBandNumber(data.listening_avg) ?? null,
    overallAvg: toBandNumber(data.overall_avg) ?? null,
    questionsAttempted:
      toNumber(data.questions_attempted) ??
      toNumber(data.total_questions_attempted) ??
      toNumber(data.questions_answered) ??
      null,
    readingAvg: toBandNumber(data.reading_avg) ?? null,
    speakingAvg: toBandNumber(data.speaking_avg) ?? null,
    totalActiveTimeSeconds: toCount(data.total_active_time_seconds),
    totalSessions:
      toNumber(data.total_practice_sessions) ??
      toNumber(data.total_sessions) ??
      toNumber(data.practice_sessions) ??
      null,
    totalSolved: toCount(data.total_solved),
    updatedAt: pickString(data.updated_at) ?? null,
    writingAvg: toBandNumber(data.writing_avg) ?? null,
  };
}

export async function getMySectionStatistics(): Promise<MySectionStatisticsItem[]> {
  const response = await axiosInstance.get(endpoints.statistics.sections);

  return getDataArray(response.data)
    .flatMap((entry) => {
      const record = asRecord(entry) ?? {};
      const section = toSectionKey(record.section);

      if (!section) {
        return [];
      }

      const item: MySectionStatisticsItem = {
        averageBand: toBandNumber(record.average_band) ?? null,
        lastPracticedAt: pickString(record.last_practiced_at) ?? null,
        section,
        solvedCount: toCount(record.solved_count),
      };

      return [item];
    });
}

export async function getMyExamStatistics(): Promise<MyExamStatistics> {
  const response = await axiosInstance.get(endpoints.statistics.exams);
  const data = getDataRecord(response.data);

  return {
    averageOverallBand: toBandNumber(data.average_overall_band) ?? null,
    contestsParticipated: toCount(data.contests_participated),
    highestOverallBand: toBandNumber(data.highest_overall_band) ?? null,
    totalMocksTaken: toCount(data.total_mocks_taken),
    updatedAt: pickString(data.updated_at) ?? null,
  };
}

export async function getGlobalSectionStatistics(): Promise<GlobalSectionStatisticsItem[]> {
  const response = await axiosInstance.get(endpoints.statistics.global);

  return getDataArray(response.data)
    .map((entry) => {
      const record = asRecord(entry) ?? {};
      const section = toSectionKey(record.section);

      if (!section) {
        return null;
      }

      return {
        section,
        totalQuestions: toCount(record.total_questions),
      };
    })
    .filter((value): value is GlobalSectionStatisticsItem => value !== null);
}
