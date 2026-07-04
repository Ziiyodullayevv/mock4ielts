import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ContestDetailView } from 'src/sections/contests/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Contest Detail | ${CONFIG.appName}` };

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ContestDetailView id={id} />;
}
