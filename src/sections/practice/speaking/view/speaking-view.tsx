'use client';

import type { PracticeOverview, PracticeQuestionItem } from '../../types';

import { PracticeWorkspace } from '@/src/sections/practice/components';

import { useSpeakingSectionsQuery } from '../hooks/use-speaking-sections-query';

const DEFAULT_OVERVIEW: PracticeOverview = {
  avgBandScore: undefined,
  savedCount: 0,
  sectionType: 'speaking',
  sourceLabel: 'Published sections',
  title: 'Speaking',
  totalAttempting: 0,
  totalQuestions: 0,
  totalSolved: 0,
  updatedAtLabel: 'Live',
};

export function SpeakingView() {
  const { data, error, isLoading } = useSpeakingSectionsQuery();

  const questions: PracticeQuestionItem[] = (data?.items ?? []).map((item) => ({
    attemptCount: item.questionCount,
    durationMinutes: item.durationMinutes,
    href: item.href,
    id: item.id,
    isStarred: false,
    isStartAvailable: true,
    questionCount: item.questionCount,
    sectionType: 'speaking',
    tokenCost: undefined,
    title: item.title,
  }));

  const overview: PracticeOverview = data
    ? {
        avgBandScore: undefined,
        savedCount: data.pagination.total,
        sectionType: 'speaking',
        sourceLabel: 'Published sections',
        title: 'Speaking',
        totalAttempting: data.pagination.total,
        totalQuestions: data.items.reduce((total, item) => total + item.questionCount, 0),
        totalSolved: 0,
        updatedAtLabel: 'Live',
      }
    : DEFAULT_OVERVIEW;

  return (
    <PracticeWorkspace
      emptyMessage="No published speaking sections found yet."
      errorMessage={error instanceof Error ? error.message : null}
      isLoading={isLoading}
      overview={overview}
      questions={questions}
      searchPlaceholder="Search speaking sections"
    />
  );
}
