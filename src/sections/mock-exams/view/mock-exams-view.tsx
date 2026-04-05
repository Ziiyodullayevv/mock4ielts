'use client';

import { PracticeWorkspace } from '@/src/sections/practice/components';

import { MOCK_EXAMS_ITEMS, MOCK_EXAMS_OVERVIEW } from '../data/mock-exams.data';

export function MockExamsView() {
  return (
    <PracticeWorkspace
      emptyMessage="No full IELTS mock exams found yet."
      overview={MOCK_EXAMS_OVERVIEW}
      questions={MOCK_EXAMS_ITEMS}
      searchPlaceholder="Search mock exams"
    />
  );
}
