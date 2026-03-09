import type { Metadata } from 'next';

import { ReadingView } from '@/sections/practice/reading/view';

export const metadata: Metadata = {
  title: 'Reading Practice',
  description: 'Improve IELTS reading speed, control, and accuracy.',
};

export default function Page() {
  return <ReadingView />;
}
