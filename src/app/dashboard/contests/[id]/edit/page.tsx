import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ContestEditView } from 'src/sections/contests/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Edit Contest | ${CONFIG.appName}` };

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ContestEditView id={id} />;
}
