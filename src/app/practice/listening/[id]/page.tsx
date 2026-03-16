import { notFound } from 'next/navigation';
import { ListeningDetailsView } from '@/sections/practice/listening/view';
import { getListeningTestById } from '@/src/sections/practice/listening/data';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const test = getListeningTestById(id);

  if (!test) {
    notFound();
  }

  return <ListeningDetailsView test={test} />;
}
