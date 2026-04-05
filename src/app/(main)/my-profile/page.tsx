import type { Metadata } from 'next';

import { MyProfileView } from '@/src/sections/profile/view';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Manage your Mock4IELTS profile details and learning preferences.',
};

export default function Page() {
  return <MyProfileView />;
}
