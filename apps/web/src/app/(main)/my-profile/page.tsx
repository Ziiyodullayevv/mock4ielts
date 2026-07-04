import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/metadata';
import { MyProfileView } from '@/src/sections/profile/view';

export const metadata: Metadata = buildPageMetadata({
  description: 'Manage your Mock4IELTS profile details and learning preferences.',
  path: '/my-profile',
  title: 'My Profile',
});

export default function Page() {
  return <MyProfileView />;
}
