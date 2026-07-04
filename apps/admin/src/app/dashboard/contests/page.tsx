import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ContestListView } from 'src/sections/contests/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Contests | ${CONFIG.appName}` };

export default function Page() {
  return <ContestListView />;
}
