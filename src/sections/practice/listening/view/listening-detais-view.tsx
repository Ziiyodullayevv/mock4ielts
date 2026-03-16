'use client';

import type { ListeningTest } from '../types';

import { paths } from '@/src/routes/paths';
import { useRouter } from 'next/navigation';

import { ListeningTestView } from '../components/listening-test-view';

type ListeningDetailsViewProps = {
  test: ListeningTest;
};

export function ListeningDetailsView({ test }: ListeningDetailsViewProps) {
  const router = useRouter();

  return (
    <ListeningTestView
      test={test}
      onBack={() => {
        router.push(paths.practice.listening.root);
      }}
    />
  );
}
