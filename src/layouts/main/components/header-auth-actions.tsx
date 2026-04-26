'use client';

import Link from 'next/link';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { TokenIcon } from '@/src/components/icons/token-icon';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import { ThemeDropdown } from '@/src/components/theme/theme-dropdown';
import { useAuthMutations } from '@/src/auth/hooks/use-auth-mutations';
import { useMyProfileQuery } from '@/src/auth/hooks/use-my-profile-query';
import { useRouter, usePathname, useSearchParams } from '@/src/routes/hooks';
import { buildLoginHref, getCurrentReturnTo } from '@/src/auth/utils/return-to';
import {
  PRACTICE_HEADER_RING_CLASS,
  PRACTICE_MENU_PANEL_RING_CLASS,
} from '@/src/layouts/practice-surface-theme';

import { HeaderAccountDropdown } from './header-account-dropdown';
import { HeaderNotificationDropdown } from './header-notification-dropdown';

type HeaderAuthActionsProps = {
  isHomePage?: boolean;
};

export function HeaderAuthActions({ isHomePage = false }: HeaderAuthActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isHydrated } = useAuthSession();
  const { logoutMutation } = useAuthMutations();
  const { data: profile, isLoading: isProfileLoading } = useMyProfileQuery(isAuthenticated);
  const currentReturnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const signInHref = buildLoginHref(currentReturnTo);
  const skeletonSurfaceClass = isHomePage ? 'bg-white/10' : 'bg-black/8 dark:bg-white/10';

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
      queryClient.removeQueries({ queryKey: ['favorites'] });
      router.replace(buildLoginHref(getCurrentReturnTo()));
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex items-center gap-2.5">
        <div className="hidden h-10 items-center gap-2.5 lg:flex">
          <div className={cn('h-10 w-[220px] rounded-full animate-pulse', skeletonSurfaceClass)} />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="sm:hidden">
            <div className="flex h-10 items-center gap-2.5">
              <div className={cn('size-5 rounded-full animate-pulse', skeletonSurfaceClass)} />
              <div className={cn('h-5 w-14 rounded-full animate-pulse', skeletonSurfaceClass)} />
            </div>
          </div>
        </div>
        <div className={cn('size-10 rounded-full animate-pulse', skeletonSurfaceClass)} />
        <div className={cn('size-10 rounded-full animate-pulse', skeletonSurfaceClass)} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <ThemeDropdown
          title="Open theme settings"
          triggerClassName={
            isHomePage
              ? 'h-10 rounded-full border border-white/10 bg-white/8 px-3 text-white shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl hover:bg-white/12 hover:text-white'
              : 'h-10 rounded-full border border-transparent bg-[#ededed] px-3 text-black shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl hover:bg-[#e3e3e3] hover:text-black dark:border-white/10 dark:bg-white/8 dark:text-white dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] dark:hover:bg-white/12 dark:hover:text-white'
          }
          triggerIconClassName={isHomePage ? 'text-white' : 'text-black dark:text-white'}
          contentClassName={`w-72 rounded-2xl p-2 text-black shadow-[0_24px_44px_rgba(15,23,42,0.12)] dark:text-white dark:shadow-[0_24px_44px_rgba(0,0,0,0.45)] ${PRACTICE_MENU_PANEL_RING_CLASS}`}
          labelClassName="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/40 dark:text-white/40"
          itemClassName="min-h-12 rounded-xl px-3 py-2 text-sm font-medium text-black/95 focus:bg-[#ededed] focus:text-black [&_svg]:text-black/70 dark:text-white/95 dark:focus:bg-white/8 dark:focus:text-white dark:[&_svg]:text-white/70"
        />

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
          <div className="flex h-10 items-center gap-2.5">
            <div className="size-5 rounded-full bg-black/8 animate-pulse dark:bg-white/10" />
            <div className="h-5 w-14 rounded-full bg-black/8 animate-pulse dark:bg-white/10" />
          </div>
        ) : (
          <div
            className={cn(
              'inline-flex h-10 items-center gap-3 rounded-full px-3.5 text-sm font-semibold shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-none',
              PRACTICE_HEADER_RING_CLASS,
              isHomePage
                ? 'text-white/85 after:!bg-[#141414]'
                : 'text-black/85 dark:text-white/85'
            )}
          >
            <TokenIcon className="size-5 shrink-0 text-[#ffb347]" />
            <span className="bg-[linear-gradient(90deg,#f7c66c_0%,#ff9f2f_100%)] bg-clip-text text-[16px] tracking-[-0.03em] text-transparent">
              {profile?.tokenBalance ?? 0}
            </span>
            <span
              className={cn(
                'h-5 w-px shrink-0',
                isHomePage ? 'bg-white/16' : 'bg-stone-300 dark:bg-white/12'
              )}
            />
            <span className="bg-[linear-gradient(90deg,#f7c66c_0%,#ff9f2f_100%)] bg-clip-text text-[16px] tracking-[-0.03em] text-transparent">
              Up to 15% off
            </span>
          </div>
        )}
      </div>

      <HeaderNotificationDropdown isHomePage={isHomePage} />
      <HeaderAccountDropdown
        avatar={profile?.avatar}
        email={profile?.email}
        fullName={profile?.fullName}
        isLoading={isProfileLoading}
        isLoggingOut={logoutMutation.isPending}
        onLogout={handleLogout}
      />
    </>
  );
}
