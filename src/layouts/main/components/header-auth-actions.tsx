'use client';

import Link from 'next/link';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { TokenIcon } from '@/src/components/icons/token-icon';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import { useAuthMutations } from '@/src/auth/hooks/use-auth-mutations';
import { useMyProfileQuery } from '@/src/auth/hooks/use-my-profile-query';
import { useRouter, usePathname, useSearchParams } from '@/src/routes/hooks';
import { buildLoginHref, getCurrentReturnTo } from '@/src/auth/utils/return-to';
import { PRACTICE_HEADER_RING_CLASS } from '@/src/layouts/practice-surface-theme';

import { HeaderAccountDropdown } from './header-account-dropdown';
import { HeaderNotificationDropdown } from './header-notification-dropdown';

type HeaderAuthActionsProps = {
  isHomePage?: boolean;
  variant?: 'default' | 'homeGlass';
};

export function HeaderAuthActions({
  isHomePage = false,
  variant = 'default',
}: HeaderAuthActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isHydrated } = useAuthSession();
  const { logoutMutation } = useAuthMutations();
  const { data: profile, isLoading: isProfileLoading } = useMyProfileQuery(isAuthenticated);
  const currentReturnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const signInHref = buildLoginHref(currentReturnTo);
  const isHomeGlass = variant === 'homeGlass';
  const useHomeOverlayTone = isHomeGlass && isHomePage;
  const simpleSkeletonClass = cn(
    'animate-pulse shadow-none',
    useHomeOverlayTone ? 'bg-black/30 backdrop-blur-2xl' : 'bg-black/8 dark:bg-white/10'
  );

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
      queryClient.removeQueries({ queryKey: ['favorites'] });
      queryClient.removeQueries({ queryKey: ['statistics'] });
      router.replace(buildLoginHref(getCurrentReturnTo()));
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex items-center gap-2.5">
        <div className={cn('hidden h-10 w-[220px] rounded-full sm:block', simpleSkeletonClass)} />
        <div className={cn('size-10 rounded-full', simpleSkeletonClass)} />
        <div className={cn('size-10 rounded-full', simpleSkeletonClass)} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button
          asChild
          className={
            isHomePage
              ? 'h-10 rounded-full border-transparent bg-white px-5 text-sm leading-none text-black hover:bg-white/90'
              : 'h-10 rounded-full px-5 text-sm leading-none'
          }
          size="sm"
          variant="black"
        >
          <Link href={signInHref}>
            Sign In
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="hidden h-10 items-center gap-2.5 sm:flex">
        {isProfileLoading ? (
          <div className={cn('h-10 w-[220px] rounded-full', simpleSkeletonClass)} />
        ) : (
          <div
            className={cn(
              'inline-flex h-10 items-center gap-3 rounded-full px-3.5 text-sm font-semibold shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-none',
              useHomeOverlayTone
                ? 'border-0 bg-black/30 text-white/92 backdrop-blur-2xl'
                : [PRACTICE_HEADER_RING_CLASS, isHomePage
                ? 'text-white/85 after:!bg-[#141414]'
                : 'text-black/85 dark:text-white/85 dark:after:bg-[#1a1a1a]']
            )}
          >
            <TokenIcon className="size-5 shrink-0 text-[#ffb347]" />
            <span className="bg-[linear-gradient(90deg,#f7c66c_0%,#ff9f2f_100%)] bg-clip-text text-[16px] tracking-[-0.03em] text-transparent">
              {profile?.tokenBalance ?? 0}
            </span>
            <span
              className={cn(
                'h-5 w-px shrink-0',
                useHomeOverlayTone
                  ? 'bg-white/20'
                  : isHomeGlass
                    ? 'bg-black/10 dark:bg-white/12'
                    : 'bg-stone-300 dark:bg-white/12'
              )}
            />
            <span className="bg-[linear-gradient(90deg,#f7c66c_0%,#ff9f2f_100%)] bg-clip-text text-[16px] tracking-[-0.03em] text-transparent">
              Up to 15% off
            </span>
          </div>
        )}
      </div>

      {isProfileLoading ? (
        <>
          <div className={cn('size-10 rounded-full', simpleSkeletonClass)} />
          <div className={cn('size-10 rounded-full', simpleSkeletonClass)} />
        </>
      ) : (
        <>
          <HeaderNotificationDropdown
            isGlass={isHomeGlass}
            isHomePage={isHomePage}
          />
          <HeaderAccountDropdown
            avatar={profile?.avatar}
            email={profile?.email}
            fullName={profile?.fullName}
            isGlass={isHomeGlass}
            isLoggingOut={logoutMutation.isPending}
            onLogout={handleLogout}
          />
        </>
      )}
    </>
  );
}
