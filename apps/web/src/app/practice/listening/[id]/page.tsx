import type { Metadata } from 'next';

import { paths } from '@/src/routes/paths';
import { buildPageMetadata } from '@/src/lib/metadata';
import { ListeningDetailsView } from '@/sections/practice/listening/view';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  return buildPageMetadata({
    description: 'Train IELTS listening with targeted drills, answer review, and timing control.',
    path: paths.practice.listening.details(id),
    title: 'Listening Practice',
  });
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ListeningDetailsView sectionId={id} />;
}
