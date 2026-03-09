import type { Metadata } from 'next';

import { ContestView } from '@/sections/contest/view';

export const metadata: Metadata = {
  title: 'Contest',
  description: 'Enter IELTS-style contests and review performance under pressure.',
};

export default function Page() {
  return <ContestView />;
}
