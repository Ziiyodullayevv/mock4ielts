import { WritingDetailsView } from '@/sections/practice/writing/view';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <WritingDetailsView sectionId={id} />;
}
