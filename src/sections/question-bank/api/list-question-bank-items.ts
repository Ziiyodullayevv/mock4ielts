import type { QuestionBankItem, QuestionBankSkill } from '../types';

import { paths } from '@/src/routes/paths';
import { endpoints, axiosInstance } from '@/src/lib/axios';

type SectionType = 'listening' | 'reading' | 'writing' | 'speaking';

type PaginationDto = {
  page: number;
  pages: number;
  size: number;
  total: number;
};

type PublishedSectionSummaryDto = {
  difficulty?: string | null;
  id: string;
  question_count?: number | null;
  section_type: SectionType;
  title: string;
};

type PublishedSectionsResponse = {
  data?: PublishedSectionSummaryDto[];
  pagination?: PaginationDto;
  success?: boolean;
};

type PublishedSectionQuestion = {
  order?: number;
  questionType?: string;
  text?: string;
};

type PublishedSectionPart = {
  order?: number;
  questions: PublishedSectionQuestion[];
  title?: string;
};

type PublishedSectionDetail = {
  id: string;
  parts: PublishedSectionPart[];
  sectionType: SectionType;
  title: string;
};

export type QuestionBankItemsResult = {
  items: QuestionBankItem[];
  summary: {
    completed: number;
    total: number;
  };
};

const PAGE_SIZE = 100;

const DEFAULT_PAGINATION: PaginationDto = {
  page: 1,
  pages: 1,
  size: PAGE_SIZE,
  total: 0,
};

const PRACTICE_HREF_BY_SECTION_TYPE: Record<SectionType, string> = {
  listening: paths.practice.listening.root,
  reading: paths.practice.reading.root,
  speaking: paths.practice.speaking.root,
  writing: paths.practice.writing.root,
};

const SKILL_BY_SECTION_TYPE: Record<SectionType, QuestionBankSkill> = {
  listening: 'Listening',
  reading: 'Reading',
  speaking: 'Speaking',
  writing: 'Writing',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asArray = (value: unknown) => (Array.isArray(value) ? value : []);

const pickNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const pickString = (value: unknown) => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalizedValue = value.replace(/\s+/g, ' ').trim();

  return normalizedValue.length ? normalizedValue : undefined;
};

const asSectionType = (value: unknown): SectionType | undefined => {
  if (value === 'listening' || value === 'reading' || value === 'writing' || value === 'speaking') {
    return value;
  }

  return undefined;
};

const formatQuestionType = (value?: string) =>
  value
    ?.split('_')
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');

const buildQuestionSubtitle = (
  sectionTitle: string,
  partTitle?: string,
  questionType?: string
) => [sectionTitle, partTitle, formatQuestionType(questionType)].filter(Boolean).join(' • ');

async function listPublishedSectionsPage(page: number): Promise<{
  items: PublishedSectionSummaryDto[];
  pagination: PaginationDto;
}> {
  const response = await axiosInstance.get<PublishedSectionsResponse>(endpoints.sections.list, {
    params: {
      page,
      size: PAGE_SIZE,
    },
  });

  return {
    items: response.data.data ?? [],
    pagination: response.data.pagination ?? DEFAULT_PAGINATION,
  };
}

async function listAllPublishedSections() {
  const firstPage = await listPublishedSectionsPage(1);
  const items = [...firstPage.items];

  for (let page = 2; page <= firstPage.pagination.pages; page += 1) {
    const nextPage = await listPublishedSectionsPage(page);
    items.push(...nextPage.items);
  }

  return items;
}

function normalizeQuestion(value: unknown): PublishedSectionQuestion | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    order: pickNumber(value.order),
    questionType: pickString(value.question_type),
    text: pickString(value.text),
  };
}

function normalizePart(value: unknown): PublishedSectionPart | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    order: pickNumber(value.order),
    questions: asArray(value.questions)
      .map(normalizeQuestion)
      .filter((question): question is PublishedSectionQuestion => question !== null),
    title: pickString(value.title),
  };
}

function normalizeSectionDetail(
  summary: PublishedSectionSummaryDto,
  payload: unknown
): PublishedSectionDetail {
  const root = isRecord(payload) ? payload : {};
  const data = isRecord(root.data) ? root.data : root;

  return {
    id: pickString(data.id) ?? summary.id,
    parts: asArray(data.parts)
      .map(normalizePart)
      .filter((part): part is PublishedSectionPart => part !== null),
    sectionType: asSectionType(data.section_type) ?? summary.section_type,
    title: pickString(data.title) ?? summary.title,
  };
}

async function getPublishedSectionDetail(summary: PublishedSectionSummaryDto) {
  const response = await axiosInstance.get(endpoints.sections.details(summary.id));

  return normalizeSectionDetail(summary, response.data);
}

export async function listQuestionBankItems(): Promise<QuestionBankItemsResult> {
  const sectionSummaries = await listAllPublishedSections();
  const sectionResults = await Promise.allSettled(
    sectionSummaries.map((section) => getPublishedSectionDetail(section))
  );

  const sections = sectionResults
    .filter((result): result is PromiseFulfilledResult<PublishedSectionDetail> => result.status === 'fulfilled')
    .map((result) => result.value);

  if (!sections.length && sectionSummaries.length) {
    throw new Error('Unable to load published section questions right now.');
  }

  let nextId = 1;

  const items = sections.flatMap((section) => {
    const sortedParts = [...section.parts].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));

    return sortedParts.flatMap((part) => {
      const sortedQuestions = [...part.questions].sort(
        (left, right) => (left.order ?? 0) - (right.order ?? 0)
      );

      return sortedQuestions.map((question) => {
        const currentId = nextId;
        nextId += 1;

        return {
          attemptCount: 0,
          completionRate: 0,
          href: PRACTICE_HREF_BY_SECTION_TYPE[section.sectionType],
          id: currentId,
          skill: SKILL_BY_SECTION_TYPE[section.sectionType],
          subtitle: buildQuestionSubtitle(section.title, part.title, question.questionType),
          title: question.text ?? `Question ${currentId}`,
        } satisfies QuestionBankItem;
      });
    });
  });

  return {
    items,
    summary: {
      completed: 0,
      total: items.length,
    },
  };
}
