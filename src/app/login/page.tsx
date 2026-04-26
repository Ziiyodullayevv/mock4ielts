import type { Metadata } from 'next';

import { AuthView } from '@/src/auth/view';
import { buildPageMetadata } from '@/src/lib/metadata';

export const metadata: Metadata = buildPageMetadata({
  description: 'Sign in to continue your IELTS practice, full mock exams, and progress tracking.',
  path: '/login',
  title: 'Login',
});

export default function Page() {
  return <AuthView />;
}
