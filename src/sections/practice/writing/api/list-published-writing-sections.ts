import { paths } from '@/src/routes/paths';
import { endpoints, axiosInstance } from '@/src/lib/axios';

type SectionDifficulty = string;

type PublishedSectionDto = {
  difficulty: SectionDifficulty;
  duration_minutes: number;
  id: string;
  question_count: number;
  section_type: 'listening' | 'reading' | 'speaking' | 'writing';
  title: string;
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

export type WritingPracticeListItem = {
  difficulty: SectionDifficulty;
  durationMinutes: number;
  href: string;
  id: number;
  questionCount: number;
  remoteId: string;
  title: string;
};

export type WritingPracticeSectionsResult = {
  items: WritingPracticeListItem[];
  pagination: PaginationDto;
};

const DEFAULT_PAGINATION: PaginationDto = {
  page: 1,
  pages: 1,
  size: 20,
  total: 0,
};

export async function listPublishedWritingSections(): Promise<WritingPracticeSectionsResult> {
  const response = await axiosInstance.get<PublishedSectionsResponse>(endpoints.sections.list, {
    params: {
      page: 1,
      section_type: 'writing',
      size: 20,
    },
  });

  const sections = response.data.data ?? [];

  return {
    items: sections.map((section, index) => ({
      difficulty: section.difficulty,
      durationMinutes: section.duration_minutes,
      href: paths.practice.writing.details(section.id),
      id: index + 1,
      questionCount: section.question_count,
      remoteId: section.id,
      title: section.title,
    })),
    pagination: response.data.pagination ?? DEFAULT_PAGINATION,
  };
}
