import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/metadata';
import { ListeningView } from '@/sections/practice/listening/view';

export const metadata: Metadata = buildPageMetadata({
  description:
    'Practice IELTS Listening with exam-style audio tasks, note completion, multiple choice, and map labelling exercises. Improve comprehension and accuracy section by section.',
  path: '/practice/listening',
  title: 'IELTS Listening Practice | Audio Tasks & Exercises',
});

export default function Page() {
  return <ListeningView />;
}
