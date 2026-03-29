import type { Metadata } from 'next';

import { WritingView } from '@/sections/practice/writing/view';

export const metadata: Metadata = {
  title: 'Writing Practice',
  description: 'Build IELTS writing structure, speed, and revision discipline.',
};

export default function Page() {
  return <WritingView />;
}
