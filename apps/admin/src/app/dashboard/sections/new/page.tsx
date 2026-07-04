import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { SectionCreateView } from 'src/sections/sections/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `New Section | ${CONFIG.appName}` };

export default function Page() {
  return <SectionCreateView />;
}
