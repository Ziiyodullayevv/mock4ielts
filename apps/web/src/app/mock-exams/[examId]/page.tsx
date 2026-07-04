import type { Metadata } from 'next';

import { paths } from '@/src/routes/paths';
import { buildPageMetadata } from '@/src/lib/metadata';
import { MockExamRunnerPage } from '@/src/sections/mock-exams/components/mock-exam-runner-sheet';

type PageProps = {
  params: Promise<{
    examId: string;
  }>;
  searchParams: Promise<{
    attemptId?: string | string[];
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { examId } = await params;

  return buildPageMetadata({
    description: 'Work through a full IELTS-style mock exam and track section-by-section progress.',
    path: paths.mockExam.details(examId),
    title: 'Mock Exam',
  });
}

export default async function Page({ params, searchParams }: PageProps) {
  const { examId } = await params;
  const { attemptId } = await searchParams;
  const resolvedAttemptId = Array.isArray(attemptId) ? attemptId[0] : attemptId;

  return <MockExamRunnerPage attemptId={resolvedAttemptId ?? null} examId={examId} />;
}
