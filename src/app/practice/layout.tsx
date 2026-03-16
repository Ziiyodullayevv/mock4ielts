'use client';

import { usePathname } from 'next/navigation';
import { MainLayout } from '@/src/layouts/main';

type Props = {
  children: React.ReactNode;
};

export default function Page({ children }: Props) {
  const pathname = usePathname();
  const isListeningDetailPage = /^\/practice\/listening\/[^/]+$/.test(pathname);

  if (isListeningDetailPage) {
    return children;
  }

  return <MainLayout>{children}</MainLayout>;
}
