'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Logo } from '@/src/components/logo';
import { Button } from '@/src/components/ui/button';
import { HEADER_ITEMS } from '@/src/layouts/nav-config-main';
import { useRef, Suspense, useState, useEffect } from 'react';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import { HeaderMobileMenu } from '@/src/layouts/main/components/header-mobile-menu';
import { HeaderAuthActions } from '@/src/layouts/main/components/header-auth-actions';

export function HomeStaticHeader() {
  const { isAuthenticated, isHydrated } = useAuthSession();
  const panelSurfaceRef = useRef<HTMLDivElement | null>(null);
  const navItemRefs = useRef<Record<string, HTMLElement | null>>({});
  const [hasScrollBackdrop, setHasScrollBackdrop] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [panelOffset, setPanelOffset] = useState(80);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const openedItem = HEADER_ITEMS.find((item) => item.id === openItemId);
  const hasPanel = Boolean(openedItem?.panelItems?.length);

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
      const panelContentInset = 24;

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
    if (!isMobileMenuOpen) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header
        onMouseLeave={() => setOpenItemId(null)}
        className={cn(
          'group/header fixed inset-x-0 top-0 z-40 transition-[background-color,backdrop-filter,box-shadow,color] duration-100 ease-linear',
          hasPanel
            ? hasScrollBackdrop
              ? 'bg-white text-black/88 shadow-[0_16px_36px_rgba(15,23,42,0.08)] dark:bg-[#101010] dark:text-white/88 dark:shadow-[0_22px_48px_rgba(0,0,0,0.26)]'
              : 'bg-[#101010] text-white/88 shadow-[0_22px_48px_rgba(0,0,0,0.26)]'
            : hasScrollBackdrop
            ? 'bg-white/78 text-black/88 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-[30px] dark:bg-black/60 dark:text-white/88 dark:shadow-none'
            : 'bg-[linear-gradient(180deg,rgba(0,0,0,0.64)0%,rgba(0,0,0,0)100%)] text-white/88'
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Logo
              size={28}
              svgClassName="h-[24px] w-auto sm:h-[28px]"
              className={hasScrollBackdrop ? 'text-black dark:text-white' : 'text-white'}
            />

            <nav className="hidden items-center gap-8 lg:flex">
              {HEADER_ITEMS.map((item) => {
                if (item.panelItems?.length) {
                  return (
                    <button
                      key={item.id}
                      ref={(element) => {
                        navItemRefs.current[item.id] = element;
                      }}
                      type="button"
                      onMouseEnter={() => setOpenItemId(item.id)}
                      onFocus={() => setOpenItemId(item.id)}
                      onClick={() => {
                        setOpenItemId((currentItemId) => (currentItemId === item.id ? null : item.id));
                      }}
                      className={cn(
                        'whitespace-nowrap rounded-full px-3 py-2 font-normal leading-5.5 text-shadow-sm transition-all duration-200 hover:backdrop-blur-[20px]',
                        openItemId === item.id && !hasScrollBackdrop && 'bg-white/14 text-white',
                        openItemId === item.id && hasScrollBackdrop && 'bg-black/6 text-black dark:bg-white/10 dark:text-white',
                        hasScrollBackdrop
                          ? 'text-black/72 hover:text-black dark:text-white/74 dark:hover:text-white'
                          : 'text-white/74 hover:text-white'
                      )}
                    >
                      {item.label}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    ref={(element) => {
                      navItemRefs.current[item.id] = element;
                    }}
                    href={item.href}
                    onMouseEnter={() => setOpenItemId(null)}
                    className={cn(
                      'whitespace-nowrap rounded-full px-3 py-2 font-normal leading-5.5 text-shadow-sm transition-all duration-200 hover:backdrop-blur-[20px]',
                      hasScrollBackdrop
                        ? 'text-black/72 hover:text-black dark:text-white/74 dark:hover:text-white'
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
            {isHydrated && isAuthenticated ? (
              <HomeHeaderAuthenticatedActions isHomePage={!hasScrollBackdrop} />
            ) : (
              <Button
                asChild
                className={cn(
                  'h-10 rounded-full px-5 text-sm leading-none',
                  hasScrollBackdrop || hasPanel
                    ? 'bg-black text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/90'
                    : 'border-transparent bg-white text-black hover:bg-white/90'
                )}
                size="sm"
                variant="black"
              >
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => {
              setOpenItemId(null);
              setIsMobileMenuOpen(true);
            }}
            className={cn(
              'inline-flex items-center justify-center p-0 transition-colors lg:hidden',
              hasScrollBackdrop
                ? 'text-black dark:text-white'
                : 'text-white'
            )}
          >
            <Menu className="size-5" strokeWidth={2.2} />
          </button>
        </div>

        <div
          className={cn(
            'relative hidden overflow-hidden transition-all duration-100 ease-linear lg:block',
            hasPanel ? 'max-h-72 translate-y-0 opacity-100' : 'max-h-0 -translate-y-2 opacity-0',
            hasPanel &&
              (hasScrollBackdrop
                ? 'border-b border-black/8 bg-white dark:border-white/12 dark:bg-[#101010]'
                : 'border-b border-white/12 bg-[#101010]')
          )}
        >
          {openedItem?.panelItems ? (
            <div ref={panelSurfaceRef} className="px-4 pb-6 pt-3 sm:px-6">
              <div style={{ paddingLeft: `${panelOffset}px` }}>
                <ul className="space-y-4">
                  {openedItem.panelItems.map((panelItem) => (
                    <li key={panelItem.href}>
                      <Link
                        href={panelItem.href}
                        onClick={() => setOpenItemId(null)}
                        className={cn(
                          'inline-block px-3 py-1 text-sm font-medium tracking-[-0.01em] transition-colors',
                          hasScrollBackdrop
                            ? 'text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white'
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
      </header>

      <HeaderMobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </>
  );
}

function HomeHeaderAuthenticatedActions({ isHomePage }: { isHomePage: boolean }) {
  return (
    <Suspense fallback={null}>
      <HeaderAuthActions isHomePage={isHomePage} variant="homeGlass" />
    </Suspense>
  );
}
