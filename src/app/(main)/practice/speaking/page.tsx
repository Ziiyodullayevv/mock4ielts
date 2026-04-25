import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/metadata';
import { SpeakingView } from '@/sections/practice/speaking/view';

export const metadata: Metadata = buildPageMetadata({
  description: 'Practise IELTS speaking with structured prompts and replay-based review.',
  path: '/practice/speaking',
  title: 'Speaking Practice',
});

export default function Page() {
  return <SpeakingView />;
}
