import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/metadata';
import { MockExamsView } from '@/sections/mock-exams/view/mock-exams-view';

export const metadata: Metadata = buildPageMetadata({
  description:
    'Take full-length IELTS mock exams that simulate the real test. Review your band score, section results, and detailed performance after each exam.',
  path: '/mock-exams',
  title: 'IELTS Mock Exams | Full Test Simulation',
});

export default function Page() {
  return <MockExamsView />;
}
