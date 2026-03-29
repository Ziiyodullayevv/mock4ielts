import type { Metadata } from 'next';

import { ListeningView } from '@/sections/practice/listening/view';

export const metadata: Metadata = {
  title: 'Listening Practice',
  description: 'Train IELTS listening with targeted drills and review loops.',
};

export default function Page() {
  return <ListeningView />;
}
