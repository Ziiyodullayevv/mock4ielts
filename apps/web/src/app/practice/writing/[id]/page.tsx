import type { Metadata } from 'next';

import { paths } from '@/src/routes/paths';
import { buildPageMetadata } from '@/src/lib/metadata';
import { WritingDetailsView } from '@/sections/practice/writing/view';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  return buildPageMetadata({
    description: 'Build IELTS writing structure, timing, and revision discipline with section-level tasks.',
    path: paths.practice.writing.details(id),
    title: 'Writing Practice',
  });
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <WritingDetailsView sectionId={id} />;
}
