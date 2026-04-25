import type { Metadata } from 'next';

import { paths } from '@/src/routes/paths';
import { buildPageMetadata } from '@/src/lib/metadata';
import { ReadingDetailsView } from '@/sections/practice/reading/view';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  return buildPageMetadata({
    description: 'Improve IELTS reading speed, control, and answer accuracy with focused section practice.',
    path: paths.practice.reading.details(id),
    title: 'Reading Practice',
  });
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ReadingDetailsView sectionId={id} />;
}
