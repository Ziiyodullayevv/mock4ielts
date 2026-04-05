'use client';

import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { TokenIcon } from '@/src/components/icons/token-icon';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import { useAuthMutations } from '@/src/auth/hooks/use-auth-mutations';
import { useMyProfileQuery } from '@/src/auth/hooks/use-my-profile-query';
import { useRouter, usePathname, useSearchParams } from '@/src/routes/hooks';
import { buildLoginHref, getCurrentReturnTo } from '@/src/auth/utils/return-to';

import { HeaderAccountDropdown } from './header-account-dropdown';
import { HeaderNotificationDropdown } from './header-notification-dropdown';

export function HeaderAuthActions() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthSession();
  const { logoutMutation } = useAuthMutations();
  const { data: profile } = useMyProfileQuery(isAuthenticated);
  const currentReturnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const signInHref = buildLoginHref(currentReturnTo);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
      router.replace(buildLoginHref(getCurrentReturnTo()));
    }
  };

  if (!isAuthenticated) {
    return (
      <Link href={signInHref}>
        <Button className="h-10 text-sm leading-none" size="sm" variant="black">
          Sign In
        </Button>
      </Link>
    );
  }

  return (
    <>
      <div className="hidden h-10 items-center gap-2.5 sm:flex">
        <TokenIcon className="text-lg" />
        <span className="bg-[linear-gradient(135deg,#ffc85a_0%,#ff9f2f_55%,#ff784b_100%)] bg-clip-text text-base font-semibold text-transparent">
          {profile?.tokenBalance ?? 0}
        </span>
        <span className="bg-[linear-gradient(135deg,#ffc85a_0%,#ff9f2f_55%,#ff784b_100%)] bg-clip-text text-sm font-medium text-transparent">
          Tokens
        </span>
      </div>

      <HeaderNotificationDropdown />
      <HeaderAccountDropdown
        avatar={profile?.avatar}
        email={profile?.email}
        fullName={profile?.fullName}
        isLoggingOut={logoutMutation.isPending}
        onLogout={handleLogout}
      />
    </>
  );
}
