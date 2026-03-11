'use client';

import Link from 'next/link';
import { cn } from '@/src/lib/utils';
import { Logo } from '@/src/components/logo';
import { usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { HEADER_ITEMS } from '@/src/layouts/nav-config-main';
import { HeaderAuthActions } from '@/src/layouts/main/components';

export function MainHeader() {
  const token = true;
  const pathname = usePathname();
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [hasScrollBackdrop, setHasScrollBackdrop] = useState(false);
  const [panelOffset, setPanelOffset] = useState(80);
  const navItemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const panelSurfaceRef = useRef<HTMLDivElement | null>(null);

  const openedItem = HEADER_ITEMS.find((item) => item.id === openItemId);
  const hasPanel = Boolean(openedItem?.panelItems?.length);
  const shouldShowHomeBackdrop = pathname === '/' && hasScrollBackdrop;
  const shouldConstrainHeaderWidth = pathname !== '/';
  const headerHorizontalPaddingClass = 'px-6';
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

  const isItemActive = (item: (typeof HEADER_ITEMS)[number]) =>
    item.matchPaths?.some((path) => pathname.startsWith(path)) ?? pathname === item.href;

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

  return (
    <div className="fixed inset-x-0 top-0 z-40" onMouseLeave={() => setOpenItemId(null)}>
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 transition-all duration-300 ease-out',
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
            <Logo />

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
                      'whitespace-nowrap text-shadow-sm px-3 rounded-full hover:backdrop-blur-[20px] py-2 font-normal leading-5.5 text-white/74 transition-all duration-200',
                      isActive && 'text-link-active',
                      !isActive && 'hover:bg-white/12 hover:text-white'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <HeaderAuthActions token={token} />
          </div>
        </div>
      </header>

      <div
        className={cn(
          'relative mx-4 overflow-hidden transition-all duration-100 ease-linear',
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
                          ? 'text-white'
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
    </div>
  );
}
