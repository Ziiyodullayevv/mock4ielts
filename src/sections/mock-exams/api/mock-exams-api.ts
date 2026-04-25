'use client';

import type { PracticeSectionType } from '@/src/sections/practice/types';

import { endpoints, axiosInstance } from '@/src/lib/axios';

type ApiRecord = Record<string, unknown>;
type MockExamSectionType = Extract<
  PracticeSectionType,
  'listening' | 'reading' | 'writing' | 'speaking'
>;

type PaginationDto = {
  page?: number;
  pages?: number;
  size?: number;
  total?: number;
};

export type MockExamSection = {
  id: string;
  order: number;
  title: string;
  type: MockExamSectionType;
};

export type MockExamListItem = {
  attemptCount: number;
  description?: string;
  durationMinutes: number;
  examType?: string;
  id: string;
  sectionCount: number;
  sections: MockExamSection[];
  title: string;
  tokenCost: number;
};

export type MockExamListResult = {
  items: MockExamListItem[];
  pagination: Required<PaginationDto>;
};

export type MockExamDetail = {
  description?: string;
  durationMinutes: number;
  examType?: string;
  id: string;
  sections: MockExamSection[];
  title: string;
  tokenCost: number;
};

export type MockExamResult = {
  attemptId: string;
  finished: boolean;
  finishedAt?: string | null;
  overallBand?: number | null;
  raw: unknown;
  score?: number | null;
  timeSpentSeconds?: number | null;
  totalScore?: number | null;
};

export type MockExamAnswerSubmit = {
  answer: unknown;
  question_id: string;
};

type MockExamSectionSubmitParams = {
  answers: MockExamAnswerSubmit[];
  attemptId: string;
  examId: string;
  sectionId: string;
};

const DEFAULT_PAGINATION: Required<PaginationDto> = {
  page: 1,
  pages: 1,
  size: 20,
  total: 0,
};

const SECTION_ORDER: MockExamSectionType[] = [
  'listening',
  'reading',
  'writing',
  'speaking',
];

const asArray = (value: unknown) => (Array.isArray(value) ? value : []);

const asRecord = (value: unknown): ApiRecord | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as ApiRecord)
    : null;

const pickNumber = (...values: unknown[]) =>
  values.find((value): value is number => typeof value === 'number' && Number.isFinite(value));

const pickString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value !== 'string') continue;

    const normalizedValue = value.replace(/\s+/g, ' ').trim();

    if (normalizedValue.length) {
      return normalizedValue;
    }
  }

  return undefined;
};

const toNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length) {
    const parsedValue = Number(value);

    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return undefined;
};

const parseOverallBand = (value: unknown) => {
  const root = asRecord(value) ?? {};
  const data = asRecord(root.data) ?? root;

  return (
    toNumber(data.overall_band) ??
    toNumber(data.overallBand) ??
    toNumber(data.band_score) ??
    toNumber(data.bandScore) ??
    null
  );
};

const getDataArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value;
  }

  const root = asRecord(value) ?? {};

  if (Array.isArray(root.data)) {
    return root.data;
  }

  return [];
};

const getDataRecord = (value: unknown) => {
  const root = asRecord(value) ?? {};

  return asRecord(root.data) ?? root;
};

const toSectionType = (...values: unknown[]): MockExamSectionType | null => {
  for (const value of values) {
    const normalizedValue = pickString(value)?.toLowerCase().replace(/_/g, '-');

    if (!normalizedValue) {
      continue;
    }

    if (normalizedValue === 'listening') return 'listening';
    if (normalizedValue === 'reading') return 'reading';
    if (normalizedValue === 'writing') return 'writing';
    if (normalizedValue === 'speaking') return 'speaking';
  }

  return null;
};

function normalizePagination(pagination?: PaginationDto | null, fallbackTotal = 0) {
  return {
    page: pagination?.page ?? DEFAULT_PAGINATION.page,
    pages: pagination?.pages ?? DEFAULT_PAGINATION.pages,
    size: pagination?.size ?? DEFAULT_PAGINATION.size,
    total: pagination?.total ?? fallbackTotal,
  };
}

function extractSections(value: unknown): MockExamSection[] {
  const sectionEntries = new Map<MockExamSectionType, MockExamSection>();

  asArray(value).forEach((entry, index) => {
    const record = asRecord(entry) ?? {};
    const type = toSectionType(record.section_type, record.sectionType, record.type, record.name);
    const id = pickString(record.section_id, record.sectionId, record.id);

    if (!type || !id) {
      return;
    }

    sectionEntries.set(type, {
      id,
      order: pickNumber(record.order, record.position) ?? index + 1,
      title: pickString(record.title) ?? `${type[0].toUpperCase()}${type.slice(1)}`,
      type,
    });
  });

  const sectionRecord = asRecord(value);

  if (sectionRecord) {
    Object.entries(sectionRecord).forEach(([key, rawValue], index) => {
      const type = toSectionType(key, asRecord(rawValue)?.section_type, asRecord(rawValue)?.type);

      if (!type || sectionEntries.has(type)) {
        return;
      }

      const record = asRecord(rawValue);
      const id = pickString(rawValue, record?.section_id, record?.sectionId, record?.id);

      if (!id) {
        return;
      }

      sectionEntries.set(type, {
        id,
        order:
          pickNumber(record?.order, record?.position) ??
          (SECTION_ORDER.indexOf(type) >= 0 ? SECTION_ORDER.indexOf(type) + 1 : index + 1),
        title:
          pickString(record?.title, record?.name) ??
          `${type[0].toUpperCase()}${type.slice(1)}`,
        type,
      });
    });
  }

  return [...sectionEntries.values()].sort((left, right) => {
    const leftOrder = left.order ?? SECTION_ORDER.indexOf(left.type) + 1;
    const rightOrder = right.order ?? SECTION_ORDER.indexOf(right.type) + 1;

    return leftOrder - rightOrder;
  });
}

function getSectionCount(record: ApiRecord, sections: MockExamSection[]) {
  return (
    pickNumber(record.section_count, record.sectionCount, record.sections_count, record.sectionsCount) ??
    sections.length ??
    0
  );
}

export async function listMockExams(query?: string): Promise<MockExamListResult> {
  const response = await axiosInstance.get(endpoints.mockExams.list, {
    params: {
      page: 1,
      q: query?.trim() || undefined,
      size: 20,
    },
  });

  const root = asRecord(response.data) ?? {};
  const items = getDataArray(response.data)
    .map((entry) => {
      const record = asRecord(entry) ?? {};
      const id = pickString(record.id, record.exam_id, record.examId);

      if (!id) {
        return null;
      }

      const sections = extractSections(record.sections);
      const sectionCount = getSectionCount(record, sections);

      return {
        attemptCount:
          pickNumber(
            record.attempt_count,
            record.attemptCount,
            record.total_attempts,
            record.totalAttempts
          ) ?? 0,
        description: pickString(record.description),
        durationMinutes:
          pickNumber(record.duration_minutes, record.durationMinutes) ?? 165,
        examType: pickString(record.exam_type, record.examType),
        id,
        sectionCount,
        sections,
        title: pickString(record.title) ?? 'IELTS Mock Exam',
        tokenCost: pickNumber(record.token_cost, record.tokenCost) ?? 10,
      } satisfies MockExamListItem;
    })
    .filter((item): item is MockExamListItem => Boolean(item));

  return {
    items,
    pagination: normalizePagination(asRecord(root.pagination) as PaginationDto | null, items.length),
  };
}

export async function getMockExamDetail(examId: string): Promise<MockExamDetail> {
  const response = await axiosInstance.get(endpoints.mockExams.details(examId));
  const data = getDataRecord(response.data);
  const sections = extractSections(data.sections);

  if (!sections.length) {
    throw new Error('Mock exam detail did not include section ids.');
  }

  return {
    description: pickString(data.description),
    durationMinutes: pickNumber(data.duration_minutes, data.durationMinutes) ?? 165,
    examType: pickString(data.exam_type, data.examType),
    id: pickString(data.id) ?? examId,
    sections,
    title: pickString(data.title) ?? 'IELTS Mock Exam',
    tokenCost: pickNumber(data.token_cost, data.tokenCost) ?? 10,
  };
}

export async function startMockExam(examId: string) {
  const response = await axiosInstance.post(endpoints.mockExams.start(examId));
  const data = getDataRecord(response.data);
  const attemptId = pickString(data.attempt_id, data.attemptId);

  if (!attemptId) {
    throw new Error('Mock exam start response did not include an attempt id.');
  }

  return { attemptId };
}

export async function submitMockExamSection(params: MockExamSectionSubmitParams) {
  const { answers, attemptId, examId, sectionId } = params;

  const response = await axiosInstance.post(endpoints.mockExams.submitSection(examId), {
    answers,
    attempt_id: attemptId,
    section_id: sectionId,
  });

  return response.data;
}

export async function finishMockExam(examId: string, attemptId: string) {
  const response = await axiosInstance.post(endpoints.mockExams.finish(examId), null, {
    params: {
      attempt_id: attemptId,
    },
  });

  const data = getDataRecord(response.data);

  return {
    attemptId: pickString(data.attempt_id, data.attemptId) ?? attemptId,
    finished: Boolean(data.finished ?? true),
  };
}

export async function getMockExamResult(
  examId: string,
  attemptId: string
): Promise<MockExamResult> {
  const response = await axiosInstance.get(endpoints.mockExams.result(examId, attemptId));
  const data = getDataRecord(response.data);

  return {
    attemptId: pickString(data.attempt_id, data.attemptId) ?? attemptId,
    finished: Boolean(data.finished ?? true),
    finishedAt: pickString(data.finished_at, data.finishedAt) ?? null,
    overallBand: parseOverallBand(response.data),
    raw: response.data,
    score:
      toNumber(data.score) ??
      toNumber(data.raw_score) ??
      toNumber(data.rawScore) ??
      null,
    timeSpentSeconds:
      toNumber(data.time_spent_seconds) ??
      toNumber(data.timeSpentSeconds) ??
      null,
    totalScore:
      toNumber(data.total_score) ??
      toNumber(data.totalScore) ??
      toNumber(data.total_questions) ??
      toNumber(data.totalQuestions) ??
      null,
  };
}
