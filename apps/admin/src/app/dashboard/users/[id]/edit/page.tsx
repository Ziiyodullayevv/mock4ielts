import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { UserEditView } from 'src/sections/users/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Edit user | ${CONFIG.appName}` };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <UserEditView id={id} />;
}
