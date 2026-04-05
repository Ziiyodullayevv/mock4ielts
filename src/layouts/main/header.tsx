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
import { useAuthMutations } from '@/src/auth/hooks/use-auth-mutations';
import { useMyProfileQuery } from '@/src/auth/hooks/use-my-profile-query';
import { Avatar, AvatarImage, AvatarFallback } from '@/src/components/ui/avatar';

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
  const [panelOffset, setPanelOffset] = useState(80);
  const { isAuthenticated } = useAuthSession();
  const { logoutMutation } = useAuthMutations();
  const { data: profile } = useMyProfileQuery(isAuthenticated);
  const navItemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const panelSurfaceRef = useRef<HTMLDivElement | null>(null);

  const openedItem = HEADER_ITEMS.find((item) => item.id === openItemId);
  const hasPanel = Boolean(openedItem?.panelItems?.length);
  const currentReturnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const signInHref = buildLoginHref(currentReturnTo);
  const shouldShowHomeBackdrop = pathname === '/' && hasScrollBackdrop;
  const shouldConstrainHeaderWidth = pathname !== '/';
  const profileFirstName = getProfileFirstName(profile?.firstName, profile?.fullName);
  const profileInitials = getProfileInitials(profile?.fullName, profile?.email);
  const headerHorizontalPaddingClass = 'px-4 sm:px-6';
  const panelOverlayClass = hasPanel
    ? 'h-full bg-black/56 opacity-100 backdrop-blur-[30px]'
    : 'h-full opacity-0';
  const headerSurfaceClass = hasPanel
    ? 'bg-transparent backdrop-blur-none'
    : shouldConstrainHeaderWidth
      ? 'bg-[#141414] backdrop-blur-[30px]'
      : shouldShowHomeBackdrop
        ? 'bg-black/60 backdrop-blur-[30px]'
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
          'relative text-white/88 transition-[background-color,backdrop-filter] duration-500 ease-out',
          headerSurfaceClass
        )}
      >
        <div className={cn('flex items-center justify-between py-4', headerHorizontalPaddingClass)}>
          <div className="flex items-center gap-6">
            <Logo size={28} />

            <nav className="hidden items-center gap-8 lg:flex">
              {HEADER_ITEMS.map((item) => {
                const isActive = isItemActive(item);
                const canOpen = Boolean(item.panelItems?.length);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    ref={(element) => {
                      navItemRefs.current[item.id] = element;
                    }}
                    onMouseEnter={() => setOpenItemId(canOpen ? item.id : null)}
                    onClick={(event) => {
                      if (!canOpen) return;

                      event.preventDefault();
                      setOpenItemId((currentItemId) =>
                        currentItemId === item.id ? null : item.id
                      );
                    }}
                    className={cn(
                      'whitespace-nowrap rounded-full px-3 py-2 font-normal leading-5.5 text-shadow-sm transition-all duration-200 hover:backdrop-blur-[20px]',
                      isActive
                        ? 'text-link-active'
                        : 'text-white/74 hover:text-white'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden items-center gap-2 sm:gap-3 lg:flex">
            <HeaderAuthActions />
          </div>

          <button
            type="button"
            onClick={() => {
              setOpenItemId(null);
              setIsMobileMenuOpen(true);
            }}
            aria-label="Open menu"
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-colors hover:bg-white/12 lg:hidden"
          >
            <Menu className="size-5" strokeWidth={2.2} />
          </button>
        </div>
      </header>

      <div
        className={cn(
          'relative mx-4 hidden overflow-hidden transition-all duration-100 ease-linear lg:block',
          shouldConstrainHeaderWidth && !hasPanel && 'bg-white/8',
          hasPanel && 'bg-transparent backdrop-blur-none',
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
                          ? 'text-link-active'
                          : 'text-white/70 hover:text-white'
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
            'absolute inset-0 bg-black/56 backdrop-blur-3xl transition-opacity duration-300',
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          )}
        />

        <div
          className={cn(
            'absolute inset-0 overflow-hidden bg-[#07080b]/78 backdrop-blur-3xl transition-all duration-300 ease-out',
            isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          )}
        >
          <div className="relative flex h-full flex-col">
            <div className={cn('flex-1 overflow-y-auto pb-8 pt-5 sm:pt-6', headerHorizontalPaddingClass)}>
              <div className="space-y-8">
                <section className="space-y-5">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <Link
                            href={paths.profile.root}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="shrink-0"
                          >
                            <Avatar className="size-14 shrink-0 ring-1 ring-white/10">
                              <AvatarImage
                                src={profile?.avatar ?? undefined}
                                alt={profile?.fullName || profile?.email || 'Profile'}
                              />
                              <AvatarFallback className="bg-white/10 text-base font-semibold text-white">
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
                              <p className="truncate text-base font-medium tracking-[-0.02em] text-white">
                                {profileFirstName}
                              </p>
                              {profile?.email ? (
                                <p className="mt-1 truncate text-sm text-white/58">{profile.email}</p>
                              ) : null}
                            </Link>
                          </div>
                        </div>

                        <button
                          type="button"
                          aria-label="Close menu"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-colors hover:bg-white/12"
                        >
                          <X className="size-5" strokeWidth={2.2} />
                        </button>
                      </div>

                      <div className="h-px w-full bg-white/10" />
                    </>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <Link
                        href={signInHref}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-base font-medium leading-6 tracking-[-0.02em] text-white/88 transition-colors hover:text-white"
                      >
                        Sign In
                      </Link>

                      <button
                        type="button"
                        aria-label="Close menu"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-colors hover:bg-white/12"
                      >
                        <X className="size-5" strokeWidth={2.2} />
                      </button>
                    </div>
                  )}
                </section>

                <section className="space-y-4">
                  {isAuthenticated ? (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-base font-medium leading-6 tracking-[-0.02em] text-white/62">
                        Tokens
                      </span>
                      <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#ffd78f]/35 bg-[linear-gradient(135deg,#ffc85a_0%,#ff9f2f_55%,#ff784b_100%)] px-2.5 py-1 text-sm font-medium text-white shadow-[0_10px_24px_rgba(255,120,75,0.24)]">
                        <span className="grid place-items-center rounded-full bg-black/10 p-1">
                          <TokenIcon monochrome className="text-sm text-white" />
                        </span>
                        <span>{profile?.tokenBalance ?? 0}</span>
                      </div>
                    </div>
                  ) : null}
                  <p className="text-sm font-medium text-white/36">Explore</p>
                  <div className="space-y-5">
                    {mobilePrimaryItems.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'block text-base font-medium leading-6 tracking-[-0.02em] transition-colors',
                          isItemActive(item) ? 'text-link-active' : 'text-white/88 hover:text-white'
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </section>

                {mobilePanelGroups.map((item) => (
                  <section key={item.id} className="space-y-4">
                    <p className="text-sm font-medium text-white/36">{item.label}</p>
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
                              isActive ? 'text-link-active' : 'text-white/88 hover:text-white'
                            )}
                          >
                            {panelItem.label}
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                ))}

                {isAuthenticated ? (
                  <section className="pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="block text-base font-medium leading-6 tracking-[-0.02em] text-white/88 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
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
