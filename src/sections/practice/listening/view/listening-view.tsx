'use client';

import type { PracticeOverview, PracticeQuestionItem } from '../../types';

import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import { PracticeWorkspace } from '@/src/sections/practice/components';
import { useFavoriteIdsQuery } from '@/src/sections/practice/hooks/use-favorite-ids-query';

import { useListeningSectionsQuery } from '../hooks/use-listening-sections-query';

const DEFAULT_OVERVIEW: PracticeOverview = {
  avgBandScore: undefined,
  savedCount: 0,
  sectionType: 'listening',
  sourceLabel: 'Published sections',
  title: 'Listening',
  totalAttempting: 0,
  totalQuestions: 0,
  totalSolved: 0,
  updatedAtLabel: 'Live',
};

export function ListeningView() {
  const { data, error, isLoading } = useListeningSectionsQuery();
  const { isAuthenticated } = useAuthSession();
  const { favoriteIds } = useFavoriteIdsQuery(isAuthenticated);

  const questions: PracticeQuestionItem[] = (data?.items ?? []).map((item) => ({
    attemptCount: item.questionCount,
    durationMinutes: item.durationMinutes,
    href: item.href,
    id: item.id,
    isStarred: favoriteIds.has(item.remoteId),
    questionCount: item.questionCount,
    remoteId: item.remoteId,
    tokenCost: undefined,
    title: item.title,
  }));

  const overview: PracticeOverview = data
      ? {
          avgBandScore: undefined,
          savedCount: data.pagination.total,
          sectionType: 'listening',
          sourceLabel: 'Published sections',
          title: 'Listening',
          totalAttempting: data.pagination.total,
        totalQuestions: data.items.reduce((total, item) => total + item.questionCount, 0),
        totalSolved: 0,
        updatedAtLabel: 'Live',
      }
    : DEFAULT_OVERVIEW;

  return (
    <PracticeWorkspace
      emptyMessage="No published listening sections found yet."
      errorMessage={error instanceof Error ? error.message : null}
      isLoading={isLoading}
      overview={overview}
      questions={questions}
      searchPlaceholder="Search listening sections"
    />
  );
}
