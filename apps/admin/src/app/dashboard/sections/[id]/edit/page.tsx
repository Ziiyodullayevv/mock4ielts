import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { SectionEditView } from 'src/sections/sections/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Edit Section | ${CONFIG.appName}` };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <SectionEditView id={id} />;
}
