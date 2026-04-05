'use client';

import type { PracticeOverview, PracticeQuestionItem } from '../../types';

import { PracticeWorkspace } from '@/src/sections/practice/components';

import { useReadingSectionsQuery } from '../hooks/use-reading-sections-query';

const DEFAULT_OVERVIEW: PracticeOverview = {
  avgBandScore: undefined,
  savedCount: 0,
  sectionType: 'reading',
  sourceLabel: 'Published sections',
  title: 'Reading',
  totalAttempting: 0,
  totalQuestions: 0,
  totalSolved: 0,
  updatedAtLabel: 'Live',
};

export function ReadingView() {
  const { data, error, isLoading } = useReadingSectionsQuery();

  const questions: PracticeQuestionItem[] = (data?.items ?? []).map((item) => ({
    attemptCount: item.questionCount,
    durationMinutes: item.durationMinutes,
    href: item.href,
    id: item.id,
    isStarred: false,
    isStartAvailable: false,
    questionCount: item.questionCount,
    sectionType: 'reading',
    tokenCost: undefined,
    title: item.title,
  }));

  const overview: PracticeOverview = data
      ? {
          avgBandScore: undefined,
          savedCount: data.pagination.total,
          sectionType: 'reading',
          sourceLabel: 'Published sections',
          title: 'Reading',
          totalAttempting: data.pagination.total,
        totalQuestions: data.items.reduce((total, item) => total + item.questionCount, 0),
        totalSolved: 0,
        updatedAtLabel: 'Live',
      }
    : DEFAULT_OVERVIEW;

  return (
    <PracticeWorkspace
      emptyMessage="No published reading sections found yet."
      errorMessage={error instanceof Error ? error.message : null}
      isLoading={isLoading}
      overview={overview}
      questions={questions}
      searchPlaceholder="Search reading sections"
    />
  );
}
