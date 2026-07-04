import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { SectionDetailView } from 'src/sections/sections/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Section Details | ${CONFIG.appName}` };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <SectionDetailView id={id} />;
}
