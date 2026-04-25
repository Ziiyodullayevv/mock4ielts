'use client';

import Link from 'next/link';
import { cn } from '@/src/lib/utils';
import { X, Menu } from 'lucide-react';
import { paths } from '@/src/routes/paths';
import { Logo } from '@/src/components/logo';
import { usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { buildLoginHref } from '@/src/auth/utils/return-to';
import { HEADER_ITEMS } from '@/src/layouts/nav-config-main';
import { TokenIcon } from '@/src/components/icons/token-icon';
import { useRouter, useSearchParams } from '@/src/routes/hooks';
import { HeaderAuthActions } from '@/src/layouts/main/components';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import { ThemeDropdown } from '@/src/components/theme/theme-dropdown';
import { useAuthMutations } from '@/src/auth/hooks/use-auth-mutations';
import { useMyProfileQuery } from '@/src/auth/hooks/use-my-profile-query';
import { Avatar, AvatarImage, AvatarFallback } from '@/src/components/ui/avatar';
import { PRACTICE_MENU_PANEL_RING_CLASS } from '@/src/layouts/practice-surface-theme';

const getProfileInitials = (fullName?: string | null, email?: string) => {
  const source = fullName?.trim() || email?.trim() || 'A';
  const parts = source.split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return 'A';
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

const getProfileFirstName = (firstName?: string | null, fullName?: string | null) => {
  const trimmedFirstName = firstName?.trim();

  if (trimmedFirstName) {
    return trimmedFirstName;
  }

  const trimmedFullName = fullName?.trim();

  if (!trimmedFullName) {
    return 'My Profile';
  }

  return trimmedFullName.split(/\s+/)[0] || 'My Profile';
};

export function MainHeader() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrollBackdrop, setHasScrollBackdrop] = useState(false);
  const [hasHeaderShadow, setHasHeaderShadow] = useState(false);
  const [panelOffset, setPanelOffset] = useState(80);
  const { isAuthenticated, isHydrated } = useAuthSession();
  const { logoutMutation } = useAuthMutations();
  const { data: profile, isLoading: isProfileLoading } = useMyProfileQuery(isAuthenticated);
  const navItemRefs = useRef<Record<string, HTMLElement | null>>({});
  const panelSurfaceRef = useRef<HTMLDivElement | null>(null);

  const openedItem = HEADER_ITEMS.find((item) => item.id === openItemId);
  const hasPanel = Boolean(openedItem?.panelItems?.length);
  const isHomePage = pathname === '/';
  const currentReturnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const signInHref = buildLoginHref(currentReturnTo);
  const shouldShowHomeBackdrop = isHomePage && hasScrollBackdrop;
  const useHomeDarkTone = isHomePage && !shouldShowHomeBackdrop;
  const shouldConstrainHeaderWidth = !isHomePage;
  const activeNavTextClass =
    'bg-[linear-gradient(90deg,#f7c66c_0%,#ff9f2f_100%)] bg-clip-text text-transparent';
  const profileFirstName = getProfileFirstName(profile?.firstName, profile?.fullName);
  const profileInitials = getProfileInitials(profile?.fullName, profile?.email);
  const headerHorizontalPaddingClass = 'px-4 sm:px-6';
  const panelOverlayClass = hasPanel
    ? isHomePage
      ? useHomeDarkTone
        ? 'h-full bg-black/56 opacity-100 backdrop-blur-[30px]'
        : 'h-full bg-white/42 opacity-100 backdrop-blur-[30px] dark:bg-black/56'
      : 'h-full bg-black/10 opacity-100 backdrop-blur-[30px] dark:bg-black/56'
    : 'h-full opacity-0';
  const headerSurfaceClass = hasPanel
    ? isHomePage
      ? useHomeDarkTone
        ? 'bg-black/45 backdrop-blur-[28px]'
        : 'bg-white/74 backdrop-blur-[28px] dark:bg-black/45'
      : 'bg-white backdrop-blur-none dark:bg-transparent'
    : shouldConstrainHeaderWidth
      ? 'bg-white backdrop-blur-[30px] dark:bg-[#141414]'
      : shouldShowHomeBackdrop
        ? 'bg-white/78 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-[30px] dark:bg-black/60 dark:shadow-none'
        : 'bg-[linear-gradient(180deg,rgba(0,0,0,0.64)0%,rgba(0,0,0,0)100%)] bg-black/0';
  const mobilePrimaryItems = HEADER_ITEMS.filter((item) => !item.panelItems?.length);
  const mobilePanelGroups = HEADER_ITEMS.filter((item) => item.panelItems?.length);

  const isItemActive = (item: (typeof HEADER_ITEMS)[number]) =>
    item.matchPaths?.some((path) => pathname.startsWith(path)) ?? pathname === item.href;

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
      setIsMobileMenuOpen(false);
      router.replace(buildLoginHref(currentReturnTo));
    }
  };

  useEffect(() => {
    const updateScrollBackdrop = () => {
      const threshold = window.innerHeight * 0.65;
      setHasScrollBackdrop(window.scrollY >= threshold);
      setHasHeaderShadow(window.scrollY > 8);
    };

    updateScrollBackdrop();
    window.addEventListener('scroll', updateScrollBackdrop, { passive: true });
    window.addEventListener('resize', updateScrollBackdrop);

    return () => {
      window.removeEventListener('scroll', updateScrollBackdrop);
      window.removeEventListener('resize', updateScrollBackdrop);
    };
  }, []);

  useEffect(() => {
    if (!hasPanel || !openItemId) return undefined;

    const updatePanelOffset = () => {
      const triggerElement = navItemRefs.current[openItemId];
      const panelElement = panelSurfaceRef.current;

      if (!triggerElement || !panelElement) return;

      const triggerRect = triggerElement.getBoundingClientRect();
      const panelRect = panelElement.getBoundingClientRect();
      const panelContentInset = 24; // matches `px-6` on the panel container
      setPanelOffset(Math.max(0, triggerRect.left - panelRect.left - panelContentInset));
    };

    const rafId = window.requestAnimationFrame(updatePanelOffset);
    window.addEventListener('resize', updatePanelOffset);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updatePanelOffset);
    };
  }, [hasPanel, openItemId]);

  useEffect(() => {
    const closeMenuTimer = window.setTimeout(() => {
      setIsMobileMenuOpen(false);
      setOpenItemId(null);
    }, 0);

    return () => {
      window.clearTimeout(closeMenuTimer);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="fixed inset-x-0 top-0 z-40" onMouseLeave={() => setOpenItemId(null)}>
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 hidden transition-all duration-300 ease-out lg:block',
          panelOverlayClass
        )}
      />

      <header
        className={cn(
          isHomePage
            ? useHomeDarkTone
              ? 'relative text-white/88 transition-[background-color,backdrop-filter] duration-500 ease-out'
              : 'relative text-black/88 transition-[background-color,backdrop-filter] duration-500 ease-out dark:text-white/88'
            : 'relative text-black/88 transition-[background-color,backdrop-filter,box-shadow,border-color] duration-500 ease-out dark:text-white/88',
          !isHomePage && !hasPanel && 'border-b border-gray-300/50 dark:border-white/10',
          headerSurfaceClass,
          !isHomePage &&
            !hasPanel &&
            hasHeaderShadow &&
            'shadow-[0_12px_32px_rgba(15,23,42,0.08)] dark:shadow-none'
        )}
      >
        <div className={cn('flex items-center justify-between py-4', headerHorizontalPaddingClass)}>
          <div className="flex items-center gap-6">
            <Logo size={28} className={useHomeDarkTone ? 'text-white' : 'text-black dark:text-white'} />

            <nav className="hidden items-center gap-8 lg:flex">
              {HEADER_ITEMS.map((item) => {
                const isActive = isItemActive(item);
                const canOpen = Boolean(item.panelItems?.length);
                const itemClassName = cn(
                  'whitespace-nowrap rounded-full px-3 py-2 font-normal leading-5.5 text-shadow-sm transition-all duration-200 hover:backdrop-blur-[20px]',
                  isActive
                    ? activeNavTextClass
                    : isHomePage
                      ? useHomeDarkTone
                        ? 'text-white/74 hover:text-white'
                        : 'text-black/72 hover:text-black dark:text-white/74 dark:hover:text-white'
                      : 'text-black/72 hover:text-black dark:text-white/74 dark:hover:text-white'
                );

                if (canOpen) {
                  return (
                    <button
                      key={item.id}
                      type="button"
                      ref={(element) => {
                        navItemRefs.current[item.id] = element;
                      }}
                      onMouseEnter={() => setOpenItemId(item.id)}
                      onFocus={() => setOpenItemId(item.id)}
                      onClick={() => {
                        setOpenItemId((currentItemId) =>
                          currentItemId === item.id ? null : item.id
                        );
                      }}
                      className={itemClassName}
                    >
                      {item.label}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    ref={(element) => {
                      navItemRefs.current[item.id] = element;
                    }}
                    onMouseEnter={() => setOpenItemId(null)}
                    className={itemClassName}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden items-center gap-2 sm:gap-3 lg:flex">
            <HeaderAuthActions isHomePage={useHomeDarkTone} />
          </div>

          <button
            type="button"
            onClick={() => {
              setOpenItemId(null);
              setIsMobileMenuOpen(true);
            }}
            aria-label="Open menu"
            className={cn(
              'inline-flex size-11 items-center justify-center rounded-full backdrop-blur-xl transition-colors lg:hidden',
              isHomePage
                ? useHomeDarkTone
                  ? 'border border-white/10 bg-white/8 text-white shadow-[0_10px_24px_rgba(0,0,0,0.28)] hover:bg-white/12'
                  : 'border border-black/8 bg-white/78 text-black shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:bg-white/92 dark:border-white/10 dark:bg-white/8 dark:text-white dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] dark:hover:bg-white/12'
                : 'border border-transparent bg-[#ededed] text-black shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:bg-[#e3e3e3] dark:border-white/10 dark:bg-white/8 dark:text-white dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] dark:hover:bg-white/12'
            )}
          >
            <Menu className="size-5" strokeWidth={2.2} />
          </button>
        </div>
      </header>

      <div
        className={cn(
          'relative hidden overflow-hidden transition-all duration-100 ease-linear lg:block',
          shouldConstrainHeaderWidth && !hasPanel && 'bg-white',
          shouldConstrainHeaderWidth && !hasPanel && 'dark:bg-white/8',
          hasPanel &&
            (isHomePage
              ? useHomeDarkTone
                ? 'border-b border-white/12 bg-black/45 shadow-[0_22px_48px_rgba(0,0,0,0.26)] backdrop-blur-[28px]'
                : 'border-b border-black/8 bg-white/72 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-[28px] dark:border-white/12 dark:bg-black/45 dark:shadow-[0_22px_48px_rgba(0,0,0,0.26)]'
              : 'border-b border-gray-300/50 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-none dark:border-white/10 dark:bg-transparent dark:shadow-[0_20px_44px_rgba(0,0,0,0.22)]'),
          hasPanel ? 'max-h-100 translate-y-0 opacity-100' : 'max-h-0 -translate-y-2 opacity-0'
        )}
      >
        {openedItem?.panelItems ? (
          <div ref={panelSurfaceRef} className={cn('pb-8 pt-2', headerHorizontalPaddingClass)}>
            <div style={{ paddingLeft: `${panelOffset}px` }}>
              <ul className="space-y-8">
                {openedItem.panelItems.map((panelItem) => (
                  <li key={panelItem.href}>
                    <Link
                      href={panelItem.href}
                      onClick={() => setOpenItemId(null)}
                      className={cn(
                        'inline-block px-3 text-sm font-medium tracking-[-0.01em] transition-colors',
                        pathname === panelItem.href
                          ? activeNavTextClass
                          : isHomePage
                            ? useHomeDarkTone
                              ? 'text-white/70 hover:text-white'
                              : 'text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white'
                            : 'text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white'
                      )}
                    >
                      {panelItem.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          'pointer-events-none fixed inset-0 z-50 lg:hidden',
          isMobileMenuOpen && 'pointer-events-auto'
        )}
      >
        <button
          type="button"
          aria-label="Close menu backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          className={cn(
            'absolute inset-0 bg-black/10 backdrop-blur-3xl transition-opacity duration-300 dark:bg-black/56',
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          )}
        />

        <div
          className={cn(
            'absolute inset-0 overflow-hidden bg-[#f7f7f7]/96 text-black backdrop-blur-3xl transition-all duration-300 ease-out dark:bg-[#07080b]/78 dark:text-white',
            isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          )}
        >
          <div className="relative flex h-full flex-col">
            <div className={cn('flex-1 overflow-y-auto pb-8 pt-5 sm:pt-6', headerHorizontalPaddingClass)}>
              <div className="space-y-8">
                <section className="space-y-5">
                  {!isHydrated ? (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <div className="size-14 shrink-0 rounded-full bg-[#eef1f5] animate-pulse dark:bg-white/10" />
                          <div className="min-w-0 flex-1 pt-1">
                            <div className="h-5 w-28 rounded-full bg-black/6 animate-pulse dark:bg-white/10" />
                            <div className="mt-2 h-4 w-40 rounded-full bg-black/6 animate-pulse dark:bg-white/8" />
                          </div>
                        </div>

                        <button
                          type="button"
                          aria-label="Close menu"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-transparent bg-[#ededed] text-black shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-colors hover:bg-[#e3e3e3] dark:border-white/10 dark:bg-white/8 dark:text-white dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] dark:hover:bg-white/12"
                        >
                          <X className="size-5" strokeWidth={2.2} />
                        </button>
                      </div>

                      <div className="h-px w-full bg-[#e8e8e8] dark:bg-white/10" />
                    </>
                  ) : isAuthenticated ? (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          {isProfileLoading ? (
                            <>
                              <div className="size-14 shrink-0 rounded-full bg-[#eef1f5] animate-pulse dark:bg-white/10" />
                              <div className="min-w-0 flex-1 pt-1">
                                <div className="h-5 w-28 rounded-full bg-black/6 animate-pulse dark:bg-white/10" />
                                <div className="mt-2 h-4 w-40 rounded-full bg-black/6 animate-pulse dark:bg-white/8" />
                              </div>
                            </>
                          ) : (
                            <>
                              <Link
                                href={paths.profile.root}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="shrink-0"
                              >
                                <Avatar className="size-14 shrink-0 ring-1 ring-[#e8e8e8] bg-[#eef1f5] dark:ring-white/10 dark:bg-[#1f2730]">
                                  <AvatarImage
                                    src={profile?.avatar ?? undefined}
                                    alt={profile?.fullName || profile?.email || 'Profile'}
                                  />
                                  <AvatarFallback className="bg-[#eef1f5] text-base font-semibold text-black dark:bg-[#1f2730] dark:text-white">
                                    {profileInitials}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>

                              <div className="min-w-0 flex-1 pt-1">
                                <Link
                                  href={paths.profile.root}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="block min-w-0"
                                >
                                  <p className="truncate text-base font-medium tracking-[-0.02em] text-black dark:text-white">
                                    {profileFirstName}
                                  </p>
                                  {profile?.email ? (
                                    <p className="mt-1 truncate text-sm text-black/58 dark:text-white/58">{profile.email}</p>
                                  ) : null}
                                </Link>
                              </div>
                            </>
                          )}
                        </div>

                        <button
                          type="button"
                          aria-label="Close menu"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-transparent bg-[#ededed] text-black shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-colors hover:bg-[#e3e3e3] dark:border-white/10 dark:bg-white/8 dark:text-white dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] dark:hover:bg-white/12"
                        >
                          <X className="size-5" strokeWidth={2.2} />
                        </button>
                      </div>

                      <div className="h-px w-full bg-[#e8e8e8] dark:bg-white/10" />
                    </>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <Link
                        href={signInHref}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-base font-medium leading-6 tracking-[-0.02em] text-black/88 transition-colors hover:text-black dark:text-white/88 dark:hover:text-white"
                      >
                        Sign In
                      </Link>

                      <button
                        type="button"
                        aria-label="Close menu"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-transparent bg-[#ededed] text-black shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-colors hover:bg-[#e3e3e3] dark:border-white/10 dark:bg-white/8 dark:text-white dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] dark:hover:bg-white/12"
                      >
                        <X className="size-5" strokeWidth={2.2} />
                      </button>
                    </div>
                  )}
                </section>

                <section className="space-y-4">
                  {!isHydrated ? (
                    <div className="flex items-center gap-2.5">
                      <div className="size-5 rounded-full bg-black/8 animate-pulse dark:bg-white/10" />
                      <div className="h-5 w-16 rounded-full bg-black/8 animate-pulse dark:bg-white/10" />
                    </div>
                  ) : isAuthenticated ? (
                    isProfileLoading ? (
                      <div className="flex items-center gap-2.5">
                        <div className="size-5 rounded-full bg-black/8 animate-pulse dark:bg-white/10" />
                        <div className="h-5 w-16 rounded-full bg-black/8 animate-pulse dark:bg-white/10" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-transparent bg-[#ededed] px-2.5 py-1 text-sm font-medium text-black shadow-[0_10px_24px_rgba(15,23,42,0.06)] dark:border-[#ffd78f]/35 dark:bg-[linear-gradient(135deg,#ffc85a_0%,#ff9f2f_55%,#ff784b_100%)] dark:text-white dark:shadow-[0_10px_24px_rgba(255,120,75,0.24)]">
                          <span className="grid place-items-center rounded-full bg-black/6 p-1 dark:bg-black/10">
                            <TokenIcon monochrome className="text-sm text-black dark:text-white" />
                          </span>
                          <span>{profile?.tokenBalance ?? 0}</span>
                        </div>
                      </div>
                    )
                  ) : null}
                  <p className="text-sm font-medium text-black/36 dark:text-white/36">Explore</p>
                  <div className="space-y-5">
                    {mobilePrimaryItems.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'block text-base font-medium leading-6 tracking-[-0.02em] transition-colors',
                          isItemActive(item)
                            ? activeNavTextClass
                            : 'text-black/88 hover:text-black dark:text-white/88 dark:hover:text-white'
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <p className="text-sm font-medium text-black/36 dark:text-white/36">Appearance</p>
                  {isHydrated ? (
                    <ThemeDropdown
                      showTriggerLabel
                      triggerLabel="Theme"
                      title="Open theme settings"
                      triggerClassName="h-11 w-full justify-between rounded-2xl border border-transparent bg-[#ededed] px-4 text-black shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl hover:bg-[#e3e3e3] dark:border-white/10 dark:bg-white/8 dark:text-white dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] dark:hover:bg-white/12"
                      triggerIconClassName="text-black dark:text-white"
                      contentClassName={`w-72 rounded-2xl p-2 text-black shadow-[0_24px_44px_rgba(15,23,42,0.12)] dark:text-white dark:shadow-[0_24px_44px_rgba(0,0,0,0.45)] ${PRACTICE_MENU_PANEL_RING_CLASS}`}
                      labelClassName="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/40 dark:text-white/40"
                      itemClassName="min-h-12 rounded-xl px-3 py-2 text-sm font-medium text-black/95 focus:bg-[#ededed] focus:text-black [&_svg]:text-black/70 dark:text-white/95 dark:focus:bg-white/8 dark:focus:text-white dark:[&_svg]:text-white/70"
                    />
                  ) : (
                    <div className="h-11 w-full rounded-2xl bg-black/6 animate-pulse dark:bg-white/8" />
                  )}
                </section>

                {mobilePanelGroups.map((item) => (
                  <section key={item.id} className="space-y-4">
                    <p className="text-sm font-medium text-black/36 dark:text-white/36">{item.label}</p>
                    <div className="space-y-5">
                      {item.panelItems?.map((panelItem) => {
                        const isActive = pathname === panelItem.href;

                        return (
                          <Link
                            key={panelItem.href}
                            href={panelItem.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              'block text-base font-medium leading-6 tracking-[-0.02em] transition-colors',
                              isActive
                                ? activeNavTextClass
                                : 'text-black/88 hover:text-black dark:text-white/88 dark:hover:text-white'
                            )}
                          >
                            {panelItem.label}
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                ))}

                {isHydrated && isAuthenticated ? (
                  <section className="pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="block text-base font-medium leading-6 tracking-[-0.02em] text-black/88 transition-colors hover:text-black disabled:cursor-not-allowed disabled:opacity-55 dark:text-white/88 dark:hover:text-white"
                    >
                      {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                    </button>
                  </section>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
