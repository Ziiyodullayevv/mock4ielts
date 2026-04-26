import type { Metadata } from 'next';

import { paths } from '@/src/routes/paths';
import { buildPageMetadata } from '@/src/lib/metadata';
import { SpeakingDetailsView } from '@/sections/practice/speaking/view';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  return buildPageMetadata({
    description: 'Practise IELTS speaking with structured prompts, recording, and replay-based review.',
    path: paths.practice.speaking.details(id),
    title: 'Speaking Practice',
  });
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return <SpeakingDetailsView sectionId={id} />;
}
