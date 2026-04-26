import { Suspense } from 'react';
import { Logo } from '@/src/components/logo';
import { ThemeDropdown } from '@/src/components/theme/theme-dropdown';

import { AuthCard, AuthCaptchaOverlay } from '../components';

export function AuthView() {
  return (
    <>
      <div className="flex min-h-screen w-full items-center justify-end px-17.5 py-12 max-lg:px-12 max-sm:min-h-[100svh] max-sm:items-start max-sm:justify-center max-sm:px-4 max-sm:pb-8 max-sm:pt-24">
        <header className="absolute left-0 top-10 px-17 max-sm:left-4 max-sm:top-6 max-sm:px-0">
          <Logo />
        </header>

        <div className="absolute right-17 top-10 max-sm:right-4 max-sm:top-6">
          <ThemeDropdown
            title="Open theme settings"
            triggerClassName="h-10 rounded-full border-white/10 bg-black/35 px-3 text-white shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl hover:bg-black/45 hover:text-white"
            triggerIconClassName="text-white"
            contentClassName="w-72 rounded-2xl border border-white/10 bg-[#141414] p-2 text-white shadow-[0_24px_44px_rgba(0,0,0,0.45)]"
            labelClassName="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40"
            itemClassName="min-h-12 rounded-xl px-3 py-2 text-sm font-medium text-white/95 focus:bg-white/8 focus:text-white [&_svg]:text-white/70"
          />
        </div>

        <Suspense fallback={null}>
          <AuthCard />
        </Suspense>
      </div>

      <AuthCaptchaOverlay />
    </>
  );
}
