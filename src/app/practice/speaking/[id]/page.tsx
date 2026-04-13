import { SpeakingDetailsView } from '@/sections/practice/speaking/view';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return <SpeakingDetailsView sectionId={id} />;
}
