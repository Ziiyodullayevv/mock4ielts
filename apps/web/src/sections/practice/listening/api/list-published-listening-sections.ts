import { paths } from '@/src/routes/paths';
import { endpoints, axiosInstance } from '@/src/lib/axios';
import {
  getSectionTokenCost,
  getSectionResultLabel,
} from '@/src/sections/practice/api/section-list-metadata';

import { LISTENING_DURATION_MINUTES } from '../constants';

type SectionDifficulty = string;

type PublishedSectionDto = {
  difficulty: SectionDifficulty;
  duration_minutes: number;
  id: string;
  question_count: number;
  result?: unknown;
  section_type: 'listening' | 'reading' | 'speaking' | 'writing';
  title: string;
  token_cost?: number | null;
};

type PaginationDto = {
  page: number;
  pages: number;
  size: number;
  total: number;
};

type PublishedSectionsResponse = {
  data?: PublishedSectionDto[];
  message?: string;
  pagination?: PaginationDto;
  success?: boolean;
};

export type ListeningPracticeListItem = {
  difficulty: SectionDifficulty;
  durationMinutes: number;
  href: string;
  id: number;
  questionCount: number;
  remoteId: string;
  resultLabel?: string;
  title: string;
  tokenCost?: number;
};

export type ListeningPracticeSectionsResult = {
  items: ListeningPracticeListItem[];
  pagination: PaginationDto;
};

const DEFAULT_PAGINATION: PaginationDto = {
  page: 1,
  pages: 1,
  size: 20,
  total: 0,
};

const normalizeDurationMinutes = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : LISTENING_DURATION_MINUTES;

export async function listPublishedListeningSections(): Promise<ListeningPracticeSectionsResult> {
  const response = await axiosInstance.get<PublishedSectionsResponse>(endpoints.sections.list, {
    params: {
      page: 1,
      section_type: 'listening',
      size: 20,
    },
  });

  const sections = response.data.data ?? [];

  return {
    items: sections.map((section, index) => ({
      difficulty: section.difficulty,
      durationMinutes: normalizeDurationMinutes(section.duration_minutes),
      href: paths.practice.listening.details(section.id),
      id: index + 1,
      questionCount: section.question_count,
      remoteId: section.id,
      resultLabel: getSectionResultLabel(section),
      title: section.title,
      tokenCost: getSectionTokenCost(section),
    })),
    pagination: response.data.pagination ?? DEFAULT_PAGINATION,
  };
}
