'use client';

import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { TokenIcon } from '@/src/components/icons/token-icon';

import { HeaderAccountDropdown } from './header-account-dropdown';
import { HeaderNotificationDropdown } from './header-notification-dropdown';

type HeaderAuthActionsProps = {
  token: boolean;
};

export function HeaderAuthActions({ token }: HeaderAuthActionsProps) {
  if (!token) {
    return (
      <Link href="/login">
        <Button className="h-10 text-sm leading-none" size="sm" variant="black">
          Sign In
        </Button>
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        className="hidden h-10 items-center gap-2 rounded-xl border border-white/5 bg-link-active/5 px-3 text-sm font-medium text-[#90cdfb] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_18px_rgba(0,0,0,0.32)] sm:flex"
      >
        <span className="grid place-items-center rounded-full">
          <TokenIcon className="text-lg" />
        </span>
        <span className="font-semibold text-link-active">15</span>
        <span className="h-5 w-px bg-[#78abd4]/55" />
        <span className="text-sm text-link-active">Up to 15% off</span>
      </button>

      <HeaderNotificationDropdown />
      <HeaderAccountDropdown />
    </>
  );
}
