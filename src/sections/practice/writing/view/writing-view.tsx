'use client';

import type { PracticeOverview, PracticeQuestionItem } from '../../types';

import { PracticeWorkspace } from '@/src/sections/practice/components';

import { useWritingSectionsQuery } from '../hooks/use-writing-sections-query';

const DEFAULT_OVERVIEW: PracticeOverview = {
  avgBandScore: undefined,
  savedCount: 0,
  sectionType: 'writing',
  sourceLabel: 'Published sections',
  title: 'Writing',
  totalAttempting: 0,
  totalQuestions: 0,
  totalSolved: 0,
  updatedAtLabel: 'Live',
};

export function WritingView() {
  const { data, error, isLoading } = useWritingSectionsQuery();

  const questions: PracticeQuestionItem[] = (data?.items ?? []).map((item) => ({
    attemptCount: item.questionCount,
    durationMinutes: item.durationMinutes,
    href: item.href,
    id: item.id,
    isStarred: false,
    isStartAvailable: false,
    questionCount: item.questionCount,
    sectionType: 'writing',
    tokenCost: undefined,
    title: item.title,
  }));

  const overview: PracticeOverview = data
    ? {
        avgBandScore: undefined,
        savedCount: data.pagination.total,
        sectionType: 'writing',
        sourceLabel: 'Published sections',
        title: 'Writing',
        totalAttempting: data.pagination.total,
        totalQuestions: data.items.reduce((total, item) => total + item.questionCount, 0),
        totalSolved: 0,
        updatedAtLabel: 'Live',
      }
    : DEFAULT_OVERVIEW;

  return (
    <PracticeWorkspace
      emptyMessage="No published writing sections found yet."
      errorMessage={error instanceof Error ? error.message : null}
      isLoading={isLoading}
      overview={overview}
      questions={questions}
      searchPlaceholder="Search writing sections"
    />
  );
}
