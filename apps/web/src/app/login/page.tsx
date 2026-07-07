import type { Metadata } from 'next';

import { AuthView } from '@/src/auth/view';
import { buildPageMetadata } from '@/src/lib/metadata';

export const metadata: Metadata = buildPageMetadata({
  description:
    'Sign in to Mock4IELTS to continue your IELTS practice, take full mock exams, and track your band score progress.',
  index: false,
  path: '/login',
  title: 'Sign In | Mock4IELTS',
});

export default function Page() {
  return <AuthView />;
}
