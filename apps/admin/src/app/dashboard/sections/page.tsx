import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { SectionListView } from 'src/sections/sections/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Sections | ${CONFIG.appName}` };

export default function Page() {
  return <SectionListView />;
}
