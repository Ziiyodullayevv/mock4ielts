'use client';

import Link from 'next/link';
import { cn } from '@/src/lib/utils';
import { useTheme } from 'next-themes';
import { paths } from '@/src/routes/paths';
import { usePathname } from 'next/navigation';
import { useRouter } from '@/src/routes/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { X, Sun, Moon, Check, SunMoon } from 'lucide-react';
import { HEADER_ITEMS } from '@/src/layouts/nav-config-main';
import { TokenIcon } from '@/src/components/icons/token-icon';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import { useAuthMutations } from '@/src/auth/hooks/use-auth-mutations';
import { useMyProfileQuery } from '@/src/auth/hooks/use-my-profile-query';
import { buildLoginHref, getCurrentReturnTo } from '@/src/auth/utils/return-to';
import { Avatar, AvatarImage, AvatarFallback } from '@/src/components/ui/avatar';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/src/components/ui/accordion';

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

type HeaderMobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  headerHorizontalPaddingClass?: string;
};

type ThemeMode = 'dark' | 'light' | 'system';

const getSafeTheme = (theme?: string): ThemeMode =>
  theme === 'light' || theme === 'dark' ? theme : 'system';

const HELP_CENTER_HREF = '/#help-center';

export function HeaderMobileMenu({
  isOpen,
  onClose,
  headerHorizontalPaddingClass = 'px-4 sm:px-6',
}: HeaderMobileMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { setTheme, theme } = useTheme();
  const { isAuthenticated, isHydrated } = useAuthSession();
  const { logoutMutation } = useAuthMutations();
  const { data: profile, isLoading: isProfileLoading } = useMyProfileQuery(isAuthenticated);
  const mobilePrimaryItems = HEADER_ITEMS.filter((item) => !item.panelItems?.length);
  const mobilePanelGroups = HEADER_ITEMS.filter((item) => item.panelItems?.length);
  const activeNavTextClass =
    'bg-[linear-gradient(90deg,#f7c66c_0%,#ff9f2f_100%)] bg-clip-text text-transparent';
  const tokenTextClassName =
    'bg-[linear-gradient(90deg,#f7c66c_0%,#ff9f2f_100%)] bg-clip-text text-transparent';
  const signInHref = buildLoginHref(getCurrentReturnTo());
  const profileFirstName = getProfileFirstName(profile?.firstName, profile?.fullName);
  const profileInitials = getProfileInitials(profile?.fullName, profile?.email);
  const activeTheme = getSafeTheme(theme);
  const ThemeIcon = activeTheme === 'system' ? SunMoon : activeTheme === 'dark' ? Moon : Sun;

  const isItemActive = (item: (typeof HEADER_ITEMS)[number]) =>
    item.matchPaths?.some((path) => pathname.startsWith(path)) ?? pathname === item.href;

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
      queryClient.removeQueries({ queryKey: ['favorites'] });
      queryClient.removeQueries({ queryKey: ['statistics'] });
      onClose();
      router.replace(buildLoginHref(getCurrentReturnTo()));
    }
  };

  return (
    <div
      className={cn('pointer-events-none fixed inset-0 z-50 lg:hidden', isOpen && 'pointer-events-auto')}
    >
      <button
        type="button"
        aria-label="Close menu backdrop"
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-black/10 backdrop-blur-3xl transition-opacity duration-300 dark:bg-black/56',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
      />

      <div
        className={cn(
          'absolute inset-0 overflow-hidden bg-[#f7f7f7]/96 text-black backdrop-blur-3xl transition-all duration-300 ease-out dark:bg-[#07080b]/78 dark:text-white',
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
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
                        onClick={onClose}
                        className="inline-flex shrink-0 items-center justify-center p-0 text-black transition-colors dark:text-white"
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
                            <Link href={paths.profile.root} onClick={onClose} className="shrink-0">
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
                              <Link href={paths.profile.root} onClick={onClose} className="block min-w-0">
                                <p className="truncate text-base font-medium tracking-[-0.02em] text-black dark:text-white">
                                  {profileFirstName}
                                </p>
                                {profile?.email ? (
                                  <p className="mt-1 truncate text-sm text-black/58 dark:text-white/58">
                                    {profile.email}
                                  </p>
                                ) : null}
                              </Link>
                            </div>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        aria-label="Close menu"
                        onClick={onClose}
                        className="inline-flex shrink-0 items-center justify-center p-0 text-black transition-colors dark:text-white"
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
                      onClick={onClose}
                      className="block text-base font-medium leading-6 tracking-[-0.02em] text-black/88 transition-colors hover:text-black dark:text-white/88 dark:hover:text-white"
                    >
                      Sign In
                    </Link>

                    <button
                      type="button"
                      aria-label="Close menu"
                      onClick={onClose}
                      className="inline-flex shrink-0 items-center justify-center p-0 text-black transition-colors dark:text-white"
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
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className={cn('text-sm font-medium', tokenTextClassName)}>Token</span>

                      <span
                        className={cn(
                          'inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold',
                          tokenTextClassName
                        )}
                      >
                        <TokenIcon className="size-4.5 shrink-0" />
                        {profile?.tokenBalance ?? 0}
                      </span>
                    </div>
                  )
                ) : null}

                <p className="text-sm font-medium text-black/36 dark:text-white/36">Explore</p>
                <div className="space-y-5">
                  {mobilePrimaryItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onClose}
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
                          onClick={onClose}
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

              <section className="space-y-4">
                <p className="text-sm font-medium text-black/36 dark:text-white/36">Appearance</p>
                {isHydrated ? (
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="theme" className="border-none">
                      <AccordionTrigger className="min-h-11 px-0 py-0 text-black no-underline shadow-none hover:no-underline dark:text-white">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <ThemeIcon className="size-5 shrink-0 text-black/90 dark:text-white/90" strokeWidth={2} />
                          <span className="text-sm font-medium">Theme</span>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="space-y-2 pt-3">
                        {[
                          {
                            label: 'System Default',
                            value: 'system' as const,
                          },
                          {
                            label: 'Light',
                            value: 'light' as const,
                          },
                          {
                            label: 'Dark',
                            value: 'dark' as const,
                          },
                        ].map((option) => {
                          const isActive = activeTheme === option.value;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setTheme(option.value)}
                              className={cn(
                                'flex min-h-11 w-full items-center gap-3 rounded-2xl bg-transparent px-0 py-3 text-left text-sm font-medium transition-colors',
                                isActive
                                  ? 'text-black dark:text-white'
                                  : 'text-black/74 hover:text-black dark:text-white/74 dark:hover:text-white'
                              )}
                            >
                              <span className="min-w-0 flex-1">{option.label}</span>
                              {isActive ? <Check className="size-4 shrink-0" strokeWidth={2.2} /> : null}
                            </button>
                          );
                        })}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <div className="h-11 w-full rounded-2xl bg-black/6 animate-pulse dark:bg-white/8" />
                )}
              </section>

              <section className="space-y-4">
                <p className="text-sm font-medium text-black/36 dark:text-white/36">Account</p>
                <div className="space-y-5">
                  {isHydrated && isAuthenticated ? (
                    <>
                      <Link
                        href={paths.favorites.root}
                        onClick={onClose}
                        className={cn(
                          'block text-base font-medium leading-6 tracking-[-0.02em] transition-colors',
                          pathname === paths.favorites.root
                            ? activeNavTextClass
                            : 'text-black/88 hover:text-black dark:text-white/88 dark:hover:text-white'
                        )}
                      >
                        Favorites
                      </Link>

                      <Link
                        href={paths.subscription.root}
                        onClick={onClose}
                        className={cn(
                          'block text-base font-medium leading-6 tracking-[-0.02em] transition-colors',
                          pathname === paths.subscription.root
                            ? activeNavTextClass
                            : 'text-black/88 hover:text-black dark:text-white/88 dark:hover:text-white'
                        )}
                      >
                        My Subscription
                      </Link>

                      <Link
                        href={paths.statistics.root}
                        onClick={onClose}
                        className={cn(
                          'block text-base font-medium leading-6 tracking-[-0.02em] transition-colors',
                          pathname === paths.statistics.root
                            ? activeNavTextClass
                            : 'text-black/88 hover:text-black dark:text-white/88 dark:hover:text-white'
                        )}
                      >
                        My Statistics
                      </Link>
                    </>
                  ) : null}

                  <Link
                    href={HELP_CENTER_HREF}
                    onClick={onClose}
                    className="block text-base font-medium leading-6 tracking-[-0.02em] text-black/88 transition-colors hover:text-black dark:text-white/88 dark:hover:text-white"
                  >
                    Help Center
                  </Link>
                </div>
              </section>

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
  );
}
