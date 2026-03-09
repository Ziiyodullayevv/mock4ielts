import type { Metadata } from 'next';

import { MockExamsView } from '@/sections/mock-exams/view';

export const metadata: Metadata = {
  title: 'Mock Exams',
  description: 'Take full IELTS-style mock exams and review complete performance.',
};

export default function Page() {
  return <MockExamsView />;
}
