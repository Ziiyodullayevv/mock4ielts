import { ListeningDetailsView } from '@/sections/practice/listening/view';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ListeningDetailsView sectionId={id} />;
}
