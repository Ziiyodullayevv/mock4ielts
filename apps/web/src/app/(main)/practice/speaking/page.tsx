import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/metadata';
import { SpeakingView } from '@/sections/practice/speaking/view';

export const metadata: Metadata = buildPageMetadata({
  description:
    'Practice IELTS Speaking with Part 1, Part 2 cue cards, and Part 3 discussion topics. Record your answers, review them, and improve fluency and coherence for your target band score.',
  path: '/practice/speaking',
  title: 'IELTS Speaking Practice | Cue Cards & Discussion Topics',
});

export default function Page() {
  return <SpeakingView />;
}
