'use client';

import { Bell } from 'lucide-react';
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

export function HeaderNotificationDropdown() {
  const unreadCount = 6;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative grid size-10 place-items-center rounded-full bg-[#1f2730] text-white/85 transition-colors hover:bg-[#283346]"
          aria-label="Open notifications"
        >
          <Bell className="size-5" />
          <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-[#ff502d] text-[10px] font-semibold text-white ring-2 ring-[#1f2730]">
            {unreadCount}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[320px] rounded-xl border-none bg-[#141414] p-3 text-sm text-white shadow-[0_20px_40px_rgba(0,0,0,0.42)]"
      >
        <p className="px-2 pb-2 text-sm font-semibold text-white/95">Notifications</p>
        <DropdownMenuSeparator className="bg-white/10" />

        {NOTIFICATION_ITEMS.map((item) => (
          <DropdownMenuItem
            key={item.id}
            className="flex h-auto flex-col items-start gap-1 rounded-xl px-3 py-2.5 text-sm text-white/92 focus:bg-white/8 focus:text-white"
          >
            <span className="text-sm leading-5">{item.title}</span>
            <span className="text-xs text-white/60">{item.time}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem className="justify-center rounded-xl px-3 py-2.5 text-sm font-medium text-link-active focus:bg-white/8 focus:text-link-active">
          View all
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
