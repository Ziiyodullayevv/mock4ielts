import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/metadata';
import { MockExamsView } from '@/sections/mock-exams/view/mock-exams-view';

export const metadata: Metadata = buildPageMetadata({
  description: 'Take full IELTS-style mock exams and review complete performance.',
  path: '/mock-exams',
  title: 'Mock Exams',
});

export default function Page() {
  return <MockExamsView />;
}
