import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MockExamListView } from 'src/sections/mock-exams/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Mock Exams | ${CONFIG.appName}` };

export default function Page() {
  return <MockExamListView />;
}
