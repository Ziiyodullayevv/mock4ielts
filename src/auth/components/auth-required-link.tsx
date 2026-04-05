'use client';

import type { ComponentProps } from 'react';

import Link from 'next/link';
import { buildLoginHref } from '@/src/auth/utils/return-to';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';

type AuthRequiredLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
  returnTo?: string;
};

export function AuthRequiredLink({
  href,
  returnTo,
  ...other
}: AuthRequiredLinkProps) {
  const { isAuthenticated } = useAuthSession();
  const resolvedHref = isAuthenticated ? href : buildLoginHref(returnTo ?? href);

  return <Link href={resolvedHref} {...other} />;
}
