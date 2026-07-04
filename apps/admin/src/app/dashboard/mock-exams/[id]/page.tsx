import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MockExamDetailView } from 'src/sections/mock-exams/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Mock Exam Detail | ${CONFIG.appName}` };

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <MockExamDetailView id={id} />;
}
