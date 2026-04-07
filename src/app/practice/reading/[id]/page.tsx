import { ReadingDetailsView } from '@/sections/practice/reading/view';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ReadingDetailsView sectionId={id} />;
}
