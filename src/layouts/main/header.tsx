'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Logo } from '@/src/components/logo';
import { usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { HEADER_ITEMS } from '@/src/layouts/nav-config-main';
import { HeaderMobileMenu, HeaderAuthActions } from '@/src/layouts/main/components';

export function MainHeader() {
  const pathname = usePathname();
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrollBackdrop, setHasScrollBackdrop] = useState(false);
  const [hasHeaderShadow, setHasHeaderShadow] = useState(false);
  const [panelOffset, setPanelOffset] = useState(80);
  const navItemRefs = useRef<Record<string, HTMLElement | null>>({});
  const panelSurfaceRef = useRef<HTMLDivElement | null>(null);

  const openedItem = HEADER_ITEMS.find((item) => item.id === openItemId);
  const hasPanel = Boolean(openedItem?.panelItems?.length);
  const isHomePage = pathname === '/';
  const shouldShowHomeBackdrop = isHomePage && hasScrollBackdrop;
  const useHomeDarkTone = isHomePage && !shouldShowHomeBackdrop;
  const shouldConstrainHeaderWidth = !isHomePage;
  const activeNavTextClass =
    'bg-[linear-gradient(90deg,#f7c66c_0%,#ff9f2f_100%)] bg-clip-text text-transparent';
  const headerHorizontalPaddingClass = 'px-4 sm:px-6';
  const panelOverlayClass = hasPanel
    ? isHomePage
      ? 'h-full bg-black/5 opacity-100'
      : 'h-full bg-black/10 opacity-100 backdrop-blur-[30px] dark:bg-black/56'
    : 'h-full opacity-0';
  const headerSurfaceClass = hasPanel
    ? isHomePage
      ? 'bg-black/5 backdrop-blur-lg'
      : 'bg-white backdrop-blur-none dark:bg-transparent'
    : shouldConstrainHeaderWidth
      ? 'bg-white backdrop-blur-[30px] dark:bg-[#141414]'
      : shouldShowHomeBackdrop
        ? 'bg-white/78 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-[30px] dark:bg-black/60 dark:shadow-none'
        : 'bg-[linear-gradient(180deg,rgba(0,0,0,0.64)0%,rgba(0,0,0,0)100%)] bg-black/0';
  const isItemActive = (item: (typeof HEADER_ITEMS)[number]) =>
    item.matchPaths?.some((path) => pathname.startsWith(path)) ?? pathname === item.href;

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
            <Logo
              size={28}
              svgClassName="h-[24px] w-auto sm:h-[28px]"
              className={useHomeDarkTone ? 'text-white' : 'text-black dark:text-white'}
            />

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
            'inline-flex items-center justify-center p-0 transition-colors lg:hidden',
            isHomePage
              ? useHomeDarkTone
                ? 'text-white'
                : 'text-black dark:text-white'
              : 'text-black dark:text-white'
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
              ? 'border-b border-white/12 bg-black/5 backdrop-blur-lg'
              : 'border-b border-gray-300/50 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-none dark:border-white/10 dark:bg-transparent dark:shadow-[0_20px_44px_rgba(0,0,0,0.22)]'),
          hasPanel ? 'max-h-100 translate-y-0 opacity-100' : 'max-h-0 -translate-y-2 opacity-0'
        )}
      >
        {openedItem?.panelItems ? (
          <div ref={panelSurfaceRef} className={cn('pb-8 pt-2', headerHorizontalPaddingClass)}>
            <div style={{ paddingLeft: `${panelOffset}px` }}>
              <ul className="space-y-2">
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
                            ? 'text-white/70 hover:text-white'
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

      <HeaderMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        headerHorizontalPaddingClass={headerHorizontalPaddingClass}
      />
    </div>
  );
}
