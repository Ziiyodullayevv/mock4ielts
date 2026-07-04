import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { UserListView } from 'src/sections/users';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Users | ${CONFIG.appName}` };

export default function Page() {
  return <UserListView />;
}
