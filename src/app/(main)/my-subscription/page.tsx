import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/metadata';
import { MySubscriptionView } from '@/src/sections/subscription/view';

export const metadata: Metadata = buildPageMetadata({
  description:
    'Compare Mock4IELTS plans, switch billing period, and review your token-focused study benefits.',
  path: '/my-subscription',
  title: 'My Subscription',
});

export default function Page() {
  return <MySubscriptionView />;
}
