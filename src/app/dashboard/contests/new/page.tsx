import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ContestForm } from 'src/sections/contests/contest-form';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `New Contest | ${CONFIG.appName}` };

export default function Page() {
  return <ContestForm />;
}
