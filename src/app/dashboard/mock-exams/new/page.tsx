import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MockExamForm } from 'src/sections/mock-exams/mock-exam-form';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `New Mock Exam | ${CONFIG.appName}` };

export default function Page() {
  return <MockExamForm />;
}
