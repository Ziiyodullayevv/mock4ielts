'use client';

import { Bell } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { PRACTICE_HEADER_RING_CLASS } from '@/src/layouts/practice-surface-theme';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/src/components/ui/dropdown-menu';

const NOTIFICATION_ITEMS = [
  {
    id: '1',
    title: 'New speaking pack is available',
    time: '2 min ago',
  },
  {
    id: '2',
    title: 'Your score report is ready',
    time: '1 hour ago',
  },
  {
    id: '3',
    title: 'Subscription discount ends today',
    time: 'Today',
  },
];

type HeaderNotificationDropdownProps = {
  isGlass?: boolean;
  isHomePage?: boolean;
  isLoading?: boolean;
};

export function HeaderNotificationDropdown({
  isGlass = false,
  isHomePage = false,
  isLoading = false,
}: HeaderNotificationDropdownProps) {
  const unreadCount = 6;
  const badgeClassName = isHomePage || isGlass
    ? 'absolute -right-0.5 -top-0.5 z-20 grid size-[1.35rem] place-items-center rounded-full bg-[#ff502d] text-[10px] font-semibold leading-none text-white ring-2 ring-[#1f2730] pointer-events-none'
    : 'absolute -right-0.5 -top-0.5 z-20 grid size-[1.35rem] place-items-center rounded-full bg-[#ff502d] text-[10px] font-semibold leading-none text-white ring-2 ring-white pointer-events-none dark:ring-[#141414]';

  if (isLoading) {
    return (
      <div className="relative size-10 shrink-0">
        <div
          className={cn(
            'relative flex size-full items-center justify-center rounded-full shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-none',
            isGlass
              ? 'border-0 bg-white/10 backdrop-blur-2xl'
              : [PRACTICE_HEADER_RING_CLASS, isHomePage ? 'after:!bg-[#141414]' : 'dark:after:bg-[#1a1a1a]']
          )}
        >
          <div
            className={cn(
              'h-5 w-4 rounded-full animate-pulse',
              isHomePage || isGlass ? 'bg-white/12' : 'bg-black/8 dark:bg-white/10'
            )}
          />
        </div>
        <span
          className={cn(
            'absolute -right-0.5 -top-0.5 z-20 size-[1.35rem] rounded-full animate-pulse bg-[#ff502d]',
            isHomePage || isGlass ? 'ring-2 ring-[#1f2730]' : 'ring-2 ring-white dark:ring-[#141414]'
          )}
        />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <div className="relative size-10 shrink-0">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'relative flex size-full items-center justify-center rounded-full shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] transition-colors dark:shadow-none',
              isGlass
                ? 'border-0 bg-white/10 text-white/92 backdrop-blur-2xl hover:bg-white/16'
                : [PRACTICE_HEADER_RING_CLASS, isHomePage
                ? 'text-white/85 after:!bg-[#141414] hover:after:!bg-[#1a1a1a]'
                : 'text-black/85 hover:after:bg-stone-100 dark:text-white/85 dark:hover:after:bg-[#1a1a1a]']
            )}
            aria-label="Open notifications"
          >
            <Bell className="size-5 -translate-y-px" />
          </button>
        </DropdownMenuTrigger>

        <span className={badgeClassName}>{unreadCount}</span>
      </div>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[320px] rounded-xl border border-transparent bg-[#f7f7f7] p-3 text-sm text-black shadow-[0_20px_40px_rgba(15,23,42,0.12)] dark:border-none dark:bg-[#141414] dark:text-white dark:shadow-[0_20px_40px_rgba(0,0,0,0.42)]"
      >
        <p className="px-2 pb-2 text-sm font-semibold text-black/95 dark:text-white/95">Notifications</p>
        <DropdownMenuSeparator className="bg-[#e8e8e8] dark:bg-white/10" />

        {NOTIFICATION_ITEMS.map((item) => (
          <DropdownMenuItem
            key={item.id}
            className="flex h-auto flex-col items-start gap-1 rounded-xl px-3 py-2.5 text-sm text-black/92 focus:bg-[#ededed] focus:text-black dark:text-white/92 dark:focus:bg-white/8 dark:focus:text-white"
          >
            <span className="text-sm leading-5">{item.title}</span>
            <span className="text-xs text-black/60 dark:text-white/60">{item.time}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-[#e8e8e8] dark:bg-white/10" />
        <DropdownMenuItem className="justify-center rounded-xl px-3 py-2.5 text-sm font-medium text-link-active focus:bg-[#ededed] focus:text-link-active dark:focus:bg-white/8">
          View all
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
