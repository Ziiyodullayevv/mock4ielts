'use client';

import Link from 'next/link';
import { paths } from '@/src/routes/paths';
import { Avatar, AvatarImage, AvatarFallback } from '@/src/components/ui/avatar';
import { LogOut, UserRound, BadgePlus, CircleHelp, MessageCircleMore } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/src/components/ui/dropdown-menu';

type HeaderAccountDropdownProps = {
  avatar?: string | null;
  email?: string;
  fullName?: string | null;
  isLoggingOut?: boolean;
  onLogout: () => Promise<void> | void;
};

const getInitials = (fullName?: string | null, email?: string) => {
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

export function HeaderAccountDropdown({
  avatar,
  email,
  fullName,
  isLoggingOut = false,
  onLogout,
}: HeaderAccountDropdownProps) {
  const fallback = getInitials(fullName, email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-10">
          <AvatarImage src={avatar ?? undefined} alt={fullName || email || 'Profile'} />
          <AvatarFallback className="bg-white text-black">{fallback}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[300px] rounded-xl border-none bg-[#141414] p-4 text-sm text-white shadow-[0_24px_44px_rgba(0,0,0,0.45)]"
      >
        <DropdownMenuLabel className="px-3 py-2">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">{fullName || 'My Account'}</span>
            {email ? <span className="text-xs text-white/60">{email}</span> : null}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-2 bg-white/10" />

        <DropdownMenuItem
          asChild
          className="h-11 rounded-xl px-3 text-sm font-medium text-white/95 focus:bg-white/8 focus:text-white"
        >
          <Link href={paths.profile.root}>
            <UserRound className="size-5 text-white/90" />
            My Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem className="h-11 rounded-xl px-3 text-sm font-medium text-white/95 focus:bg-white/8 focus:text-white">
          <BadgePlus className="size-5 text-white/90" />
          My Subscription
        </DropdownMenuItem>

        <DropdownMenuItem className="h-11 rounded-xl px-3 text-sm font-medium text-white/95 focus:bg-white/8 focus:text-white">
          <CircleHelp className="size-5 text-white/90" />
          Help Center
        </DropdownMenuItem>

        <DropdownMenuItem className="h-11 rounded-xl px-3 text-sm font-medium text-white/95 focus:bg-white/8 focus:text-white">
          <MessageCircleMore className="size-5 text-white/90" />
          Connect on Discord
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2 bg-white/10" />

        <DropdownMenuItem
          className="h-11 rounded-xl px-3 text-sm font-medium text-white/65 focus:bg-white/8 focus:text-white"
          disabled={isLoggingOut}
          onSelect={(event) => {
            event.preventDefault();
            void onLogout();
          }}
        >
          <LogOut className="size-5 text-white/90" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
