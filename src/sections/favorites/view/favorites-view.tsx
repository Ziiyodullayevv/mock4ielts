'use client';

import type {
  PracticeOverview,
  PracticeSectionType,
  PracticeQuestionItem,
} from '@/src/sections/practice/types';

import { useMemo, useEffect } from 'react';
import { paths } from '@/src/routes/paths';
import { useRouter } from '@/src/routes/hooks';
import { useQueries } from '@tanstack/react-query';
import { endpoints, axiosInstance } from '@/src/lib/axios';
import { buildLoginHref } from '@/src/auth/utils/return-to';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import { PracticeWorkspace } from '@/src/sections/practice/components';
import { useFavoriteIdsQuery } from '@/src/sections/practice/hooks/use-favorite-ids-query';
import { useReadingSectionsQuery } from '@/src/sections/practice/reading/hooks/use-reading-sections-query';
import { useWritingSectionsQuery } from '@/src/sections/practice/writing/hooks/use-writing-sections-query';
import { useSpeakingSectionsQuery } from '@/src/sections/practice/speaking/hooks/use-speaking-sections-query';
import { useListeningSectionsQuery } from '@/src/sections/practice/listening/hooks/use-listening-sections-query';

const DEFAULT_OVERVIEW: PracticeOverview = {
  avgBandScore: undefined,
  savedCount: 0,
  sectionType: 'favorites',
  sourceLabel: 'User favorites',
  summaryLabel: 'User favorites · 0 sections',
  title: 'Favorites',
  totalAttempting: 0,
  totalQuestions: 0,
  totalSolved: 0,
  updatedAtLabel: 'Live',
};

const SECTION_LABELS: Record<PracticeSectionType, string> = {
  listening: 'Listening',
  'mock-exam': 'Mock Exam',
  reading: 'Reading',
  speaking: 'Speaking',
  writing: 'Writing',
};

type FavoriteSectionItem = PracticeQuestionItem & {
  remoteId: string;
};

type SkillSectionType = Exclude<PracticeSectionType, 'mock-exam'>;
type ApiRecord = Record<string, unknown>;

function getSectionQuestionLabel(questionCount?: number) {
  return `${questionCount ?? 0} Questions`;
}

function asRecord(value: unknown): ApiRecord | null {
  return typeof value === 'object' && value !== null ? (value as ApiRecord) : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function pickString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === 'string' && value.length > 0);
}

function pickNumber(...values: unknown[]) {
  return values.find(
    (value): value is number => typeof value === 'number' && Number.isFinite(value)
  );
}

function toSkillSectionType(value: unknown): SkillSectionType | null {
  if (value === 'listening' || value === 'reading' || value === 'writing' || value === 'speaking') {
    return value;
  }

  return null;
}

function getPracticeHref(sectionType: SkillSectionType, sectionId: string) {
  switch (sectionType) {
    case 'listening':
      return paths.practice.listening.details(sectionId);
    case 'reading':
      return paths.practice.reading.details(sectionId);
    case 'writing':
      return paths.practice.writing.details(sectionId);
    case 'speaking':
      return paths.practice.speaking.details(sectionId);
    default:
      return paths.practice.listening.details(sectionId);
  }
}

function countQuestions(partsValue: unknown): number {
  return asArray(partsValue).reduce<number>((total, part) => {
    const partRecord = asRecord(part);

    return total + asArray(partRecord?.questions).length;
  }, 0);
}

async function getFavoriteSectionItem(sectionId: string): Promise<FavoriteSectionItem | null> {
  const response = await axiosInstance.get(endpoints.sections.details(sectionId));
  const root = asRecord(response.data) ?? {};
  const section = asRecord(root.data) ?? root;
  const sectionType = toSkillSectionType(section.section_type ?? section.sectionType);

  if (!sectionType) {
    return null;
  }

  const questionCount =
    pickNumber(section.question_count, section.questionCount) ?? countQuestions(section.parts);

  return {
    attemptCount: questionCount,
    durationMinutes: pickNumber(section.duration_minutes, section.durationMinutes),
    href: getPracticeHref(sectionType, sectionId),
    id: 0,
    isStarred: true,
    isStartAvailable: sectionType !== 'listening',
    questionCount,
    remoteId: sectionId,
    sectionType,
    statLabel: getSectionQuestionLabel(questionCount),
    title: pickString(section.title) ?? SECTION_LABELS[sectionType],
  };
}

export function FavoritesView() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthSession();
  const favoritesQuery = useFavoriteIdsQuery(isAuthenticated);
  const listeningQuery = useListeningSectionsQuery();
  const readingQuery = useReadingSectionsQuery();
  const writingQuery = useWritingSectionsQuery();
  const speakingQuery = useSpeakingSectionsQuery();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(buildLoginHref(paths.favorites.root));
    }
  }, [isAuthenticated, isHydrated, router]);

  const favoriteSectionIds = useMemo(
    () => (favoritesQuery.data?.items ?? []).map((item) => item.sectionId),
    [favoritesQuery.data?.items]
  );

  const allSectionItems = useMemo<FavoriteSectionItem[]>(
    () => [
      ...(listeningQuery.data?.items ?? []).map((item) => ({
        attemptCount: item.questionCount,
        durationMinutes: item.durationMinutes,
        href: item.href,
        id: item.id,
        isStarred: true,
        questionCount: item.questionCount,
        remoteId: item.remoteId,
        sectionType: 'listening' as const,
        statLabel: getSectionQuestionLabel(item.questionCount),
        title: item.title,
      })),
      ...(readingQuery.data?.items ?? []).map((item) => ({
        attemptCount: item.questionCount,
        durationMinutes: item.durationMinutes,
        href: item.href,
        id: item.id,
        isStarred: true,
        isStartAvailable: true,
        questionCount: item.questionCount,
        remoteId: item.remoteId,
        sectionType: 'reading' as const,
        statLabel: getSectionQuestionLabel(item.questionCount),
        title: item.title,
      })),
      ...(writingQuery.data?.items ?? []).map((item) => ({
        attemptCount: item.questionCount,
        durationMinutes: item.durationMinutes,
        href: item.href,
        id: item.id,
        isStarred: true,
        isStartAvailable: true,
        questionCount: item.questionCount,
        remoteId: item.remoteId,
        sectionType: 'writing' as const,
        statLabel: getSectionQuestionLabel(item.questionCount),
        title: item.title,
      })),
      ...(speakingQuery.data?.items ?? []).map((item) => ({
        attemptCount: item.questionCount,
        durationMinutes: item.durationMinutes,
        href: item.href,
        id: item.id,
        isStarred: true,
        isStartAvailable: true,
        questionCount: item.questionCount,
        remoteId: item.remoteId,
        sectionType: 'speaking' as const,
        statLabel: getSectionQuestionLabel(item.questionCount),
        title: item.title,
      })),
    ],
    [
      listeningQuery.data?.items,
      readingQuery.data?.items,
      speakingQuery.data?.items,
      writingQuery.data?.items,
    ]
  );

  const knownSectionIds = useMemo(
    () => new Set(allSectionItems.map((item) => item.remoteId)),
    [allSectionItems]
  );

  const missingFavoriteSectionIds = useMemo(
    () => favoriteSectionIds.filter((sectionId) => !knownSectionIds.has(sectionId)),
    [favoriteSectionIds, knownSectionIds]
  );

  const fallbackFavoriteQueries = useQueries({
    queries: missingFavoriteSectionIds.map((sectionId) => ({
      enabled: isAuthenticated,
      queryFn: () => getFavoriteSectionItem(sectionId),
      queryKey: ['favorites', 'section-detail', sectionId],
      retry: false,
      staleTime: 1000 * 60,
    })),
  });

  const fallbackSectionItems = useMemo(
    () =>
      fallbackFavoriteQueries
        .map((query) => query.data)
        .filter((item): item is FavoriteSectionItem => Boolean(item)),
    [fallbackFavoriteQueries]
  );

  const sectionItemsById = useMemo(
    () =>
      new Map([...allSectionItems, ...fallbackSectionItems].map((item) => [item.remoteId, item])),
    [allSectionItems, fallbackSectionItems]
  );

  const questions = useMemo<PracticeQuestionItem[]>(
    () =>
      favoriteSectionIds
        .map((sectionId) => sectionItemsById.get(sectionId))
        .filter((item): item is FavoriteSectionItem => Boolean(item))
        .map((item, index) => ({
          ...item,
          countLabel: item.sectionType ? SECTION_LABELS[item.sectionType] : item.countLabel,
          id: index + 1,
          isStarred: true,
        })),
    [favoriteSectionIds, sectionItemsById]
  );

  const overview: PracticeOverview = questions.length
    ? {
        avgBandScore: undefined,
        savedCount: questions.length,
        sectionType: 'favorites',
        sourceLabel: 'User favorites',
        summaryLabel: `User favorites · ${questions.length} sections`,
        title: 'Favorites',
        totalAttempting: questions.length,
        totalQuestions: questions.reduce((total, item) => total + (item.questionCount ?? 0), 0),
        totalSolved: 0,
        updatedAtLabel: 'Live',
      }
    : DEFAULT_OVERVIEW;

  const error =
    favoritesQuery.error ??
    listeningQuery.error ??
    readingQuery.error ??
    writingQuery.error ??
    speakingQuery.error ??
    fallbackFavoriteQueries.find((query) => query.error)?.error;

  const isLoading =
    !isHydrated ||
    (isAuthenticated &&
      (favoritesQuery.isLoading ||
        listeningQuery.isLoading ||
        readingQuery.isLoading ||
        writingQuery.isLoading ||
        speakingQuery.isLoading ||
        fallbackFavoriteQueries.some((query) => query.isLoading)));

  if (isHydrated && !isAuthenticated) {
    return null;
  }

  return (
    <PracticeWorkspace
      emptyMessage="No favorites added yet."
      errorMessage={error instanceof Error ? error.message : null}
      isLoading={isLoading}
      overview={overview}
      questions={questions}
      searchPlaceholder="Search favorite sections"
    />
  );
}
