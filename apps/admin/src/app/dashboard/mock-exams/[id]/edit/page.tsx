import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MockExamEditView } from 'src/sections/mock-exams/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Edit Mock Exam | ${CONFIG.appName}` };

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <MockExamEditView id={id} />;
}
