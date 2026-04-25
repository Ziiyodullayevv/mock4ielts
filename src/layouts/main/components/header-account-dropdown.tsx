'use client';

import Link from 'next/link';
import { cn } from '@/src/lib/utils';
import { useTheme } from 'next-themes';
import { paths } from '@/src/routes/paths';
import { Avatar, AvatarImage, AvatarFallback } from '@/src/components/ui/avatar';
import {
  PRACTICE_HEADER_RING_CLASS,
  PRACTICE_MENU_PANEL_RING_CLASS,
} from '@/src/layouts/practice-surface-theme';
import {
  Star,
  Moon,
  Sun,
  LogOut,
  UserRound,
  BadgePlus,
  CircleHelp,
  MonitorCog,
  MessageCircleMore,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuSub,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/src/components/ui/dropdown-menu';

type ThemeMode = 'dark' | 'light' | 'system';

type HeaderAccountDropdownProps = {
  avatar?: string | null;
  email?: string;
  fullName?: string | null;
  isLoading?: boolean;
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

const getSafeTheme = (theme?: string): ThemeMode =>
  theme === 'light' || theme === 'dark' ? theme : 'system';

export function HeaderAccountDropdown({
  avatar,
  email,
  fullName,
  isLoading = false,
  isLoggingOut = false,
  onLogout,
}: HeaderAccountDropdownProps) {
  const { setTheme, theme } = useTheme();
  const fallback = getInitials(fullName, email);
  const activeTheme = getSafeTheme(theme);
  const themeLabel =
    activeTheme === 'system' ? 'System Default' : activeTheme === 'dark' ? 'Dark' : 'Light';
  const ThemeIcon = activeTheme === 'system' ? MonitorCog : activeTheme === 'dark' ? Moon : Sun;

  if (isLoading) {
    return (
      <div className="size-10 rounded-full border border-transparent bg-[#eef1f5] shadow-[0_10px_24px_rgba(15,23,42,0.08)] animate-pulse dark:bg-[#1f2730] dark:shadow-none" />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className={cn(
            'relative flex size-10 items-center justify-center rounded-full shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] transition-colors hover:after:bg-stone-100 dark:shadow-none dark:hover:after:bg-[#1a1a1a]',
            PRACTICE_HEADER_RING_CLASS
          )}
        >
          <Avatar className="size-[38px] border border-transparent bg-[#1e1e1e] shadow-none">
            <AvatarImage src={avatar ?? undefined} alt={fullName || email || 'Profile'} />
            <AvatarFallback className="border border-transparent bg-[#1e1e1e] text-[1rem] font-medium leading-none text-white shadow-none">
              {fallback}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className={`w-[300px] rounded-xl p-4 text-sm text-black shadow-[0_24px_44px_rgba(15,23,42,0.12)] dark:text-white dark:shadow-[0_24px_44px_rgba(0,0,0,0.45)] ${PRACTICE_MENU_PANEL_RING_CLASS}`}
      >
        <DropdownMenuLabel className="px-3 py-2">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-black dark:text-white">{fullName || 'My Account'}</span>
            {email ? <span className="text-xs text-black/60 dark:text-white/60">{email}</span> : null}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-2 bg-[#e8e8e8] dark:bg-white/10" />

        <DropdownMenuItem
          asChild
          className="h-11 rounded-xl px-3 text-sm font-medium text-black/95 focus:bg-[#ededed] focus:text-black dark:text-white/95 dark:focus:bg-white/8 dark:focus:text-white"
        >
          <Link href={paths.profile.root}>
            <UserRound className="size-5 text-black/90 dark:text-white/90" />
            My Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          asChild
          className="h-11 rounded-xl px-3 text-sm font-medium text-black/95 focus:bg-[#ededed] focus:text-black dark:text-white/95 dark:focus:bg-white/8 dark:focus:text-white"
        >
          <Link href={paths.favorites.root}>
            <Star className="size-5 text-black/90 dark:text-white/90" />
            Favorites
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          asChild
          className="h-11 rounded-xl px-3 text-sm font-medium text-black/95 focus:bg-[#ededed] focus:text-black dark:text-white/95 dark:focus:bg-white/8 dark:focus:text-white"
        >
          <Link href={paths.subscription.root}>
            <BadgePlus className="size-5 text-black/90 dark:text-white/90" />
            My Subscription
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem className="h-11 rounded-xl px-3 text-sm font-medium text-black/95 focus:bg-[#ededed] focus:text-black dark:text-white/95 dark:focus:bg-white/8 dark:focus:text-white">
          <CircleHelp className="size-5 text-black/90 dark:text-white/90" />
          Help Center
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="h-11 rounded-xl px-3 text-sm font-medium text-black/95 focus:bg-[#ededed] focus:text-black data-[state=open]:bg-[#ededed] data-[state=open]:text-black dark:text-white/95 dark:focus:bg-white/8 dark:focus:text-white dark:data-[state=open]:bg-white/8 dark:data-[state=open]:text-white">
            <ThemeIcon className="size-5 text-black/90 dark:text-white/90" strokeWidth={2} />
            <span className="truncate">{themeLabel}</span>
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent
            sideOffset={10}
            className={`w-[230px] rounded-xl p-2 text-black shadow-[0_24px_44px_rgba(15,23,42,0.12)] dark:text-white dark:shadow-[0_24px_44px_rgba(0,0,0,0.45)] ${PRACTICE_MENU_PANEL_RING_CLASS}`}
          >
            <DropdownMenuCheckboxItem
              checked={activeTheme === 'system'}
              onSelect={() => setTheme('system')}
              className="h-11 rounded-xl py-2 pr-3 pl-10 text-[15px] font-medium text-black/62 data-[state=checked]:text-black focus:bg-[#ededed] focus:text-black dark:text-white/62 dark:data-[state=checked]:text-white dark:focus:bg-white/8 dark:focus:text-white"
            >
              System Default
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={activeTheme === 'light'}
              onSelect={() => setTheme('light')}
              className="h-11 rounded-xl py-2 pr-3 pl-10 text-[15px] font-medium text-black/62 data-[state=checked]:text-black focus:bg-[#ededed] focus:text-black dark:text-white/62 dark:data-[state=checked]:text-white dark:focus:bg-white/8 dark:focus:text-white"
            >
              Light
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={activeTheme === 'dark'}
              onSelect={() => setTheme('dark')}
              className="h-11 rounded-xl py-2 pr-3 pl-10 text-[15px] font-medium text-black/62 data-[state=checked]:text-black focus:bg-[#ededed] focus:text-black dark:text-white/62 dark:data-[state=checked]:text-white dark:focus:bg-white/8 dark:focus:text-white"
            >
              Dark
            </DropdownMenuCheckboxItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem className="h-11 rounded-xl px-3 text-sm font-medium text-black/95 focus:bg-[#ededed] focus:text-black dark:text-white/95 dark:focus:bg-white/8 dark:focus:text-white">
          <MessageCircleMore className="size-5 text-black/90 dark:text-white/90" />
          Connect on Discord
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2 bg-[#e8e8e8] dark:bg-white/10" />

        <DropdownMenuItem
          className="h-11 rounded-xl px-3 text-sm font-medium text-black/65 focus:bg-[#ededed] focus:text-black dark:text-white/65 dark:focus:bg-white/8 dark:focus:text-white"
          disabled={isLoggingOut}
          onSelect={(event) => {
            event.preventDefault();
            void onLogout();
          }}
        >
          <LogOut className="size-5 text-black/90 dark:text-white/90" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
