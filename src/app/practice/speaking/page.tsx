import type { Metadata } from 'next';

import { SpeakingView } from '@/sections/practice/speaking/view';

export const metadata: Metadata = {
  title: 'Speaking Practice',
  description: 'Practise IELTS speaking with structured prompts and replay-based review.',
};

export default function Page() {
  return <SpeakingView />;
}
