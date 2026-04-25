'use client';

import type { PracticeOverview, PracticeQuestionItem } from '@/src/sections/practice/types';

import { useEffect } from 'react';
import { paths } from '@/src/routes/paths';
import { useRouter } from '@/src/routes/hooks';
import { buildLoginHref } from '@/src/auth/utils/return-to';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import { PracticeWorkspace } from '@/src/sections/practice/components';

import { useMockExamsQuery } from '../hooks/use-mock-exams-query';

const DEFAULT_OVERVIEW: PracticeOverview = {
  avgBandScore: undefined,
  savedCount: 0,
  sectionType: 'mock-exam',
  sourceLabel: 'Full IELTS format',
  summaryLabel: 'Full IELTS format · 0 exams',
  title: 'Mock Exams',
  totalAttempting: 0,
  totalQuestions: 0,
  totalSolved: 0,
  updatedAtLabel: 'Live',
};

export function MockExamsView() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthSession();
  const { data, error, isLoading } = useMockExamsQuery(isAuthenticated);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(buildLoginHref(paths.mockExam.root));
    }
  }, [isAuthenticated, isHydrated, router]);

  const questions: PracticeQuestionItem[] = (data?.items ?? []).map((item, index) => ({
    attemptCount: item.attemptCount,
    countLabel: `${item.sectionCount} skills`,
    durationMinutes: item.durationMinutes,
    examId: item.id,
    href: paths.mockExam.details(item.id),
    id: index + 1,
    isStartAvailable: true,
    questionCount: item.sectionCount,
    sectionType: 'mock-exam',
    statLabel: `${item.sectionCount} sections`,
    title: item.title,
    tokenCost: item.tokenCost,
  }));

  const overview: PracticeOverview = questions.length
    ? {
        avgBandScore: undefined,
        savedCount: questions.length,
        sectionType: 'mock-exam',
        sourceLabel: 'Full IELTS format',
        summaryLabel: `Full IELTS format · ${questions.length} exams`,
        title: 'Mock Exams',
        totalAttempting: questions.length,
        totalQuestions: questions.reduce((total, item) => total + (item.questionCount ?? 0), 0),
        totalSolved: 0,
        updatedAtLabel: 'Live',
      }
    : DEFAULT_OVERVIEW;

  if (isHydrated && !isAuthenticated) {
    return null;
  }

  return (
    <PracticeWorkspace
      emptyMessage="No full IELTS mock exams found yet."
      errorMessage={error instanceof Error ? error.message : null}
      isLoading={!isHydrated || (isAuthenticated && isLoading)}
      overview={overview}
      questions={questions}
      searchPlaceholder="Search mock exams"
    />
  );
}
