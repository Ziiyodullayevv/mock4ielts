import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { UserCreateView } from 'src/sections/users/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Create user | ${CONFIG.appName}` };

export default function Page() {
  return <UserCreateView />;
}

