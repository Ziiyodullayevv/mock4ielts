'use client';

import type {
  NotificationItem,
  NotificationCategory,
} from '@/src/sections/notifications/api/notification-api';

import { cn } from '@/src/lib/utils';
import { useTheme } from 'next-themes';
import { useMemo, useState } from 'react';
import { toast } from '@/src/components/ui/sonner';
import { PRACTICE_HEADER_RING_CLASS } from '@/src/layouts/practice-surface-theme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/src/components/ui/dropdown-menu';
import {
  Bell,
  Gift,
  Check,
  Trophy,
  BellOff,
  Sparkles,
  Megaphone,
  RefreshCw,
  ChevronDown,
  CircleAlert,
} from 'lucide-react';
import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '@/src/sections/notifications/hooks/use-notifications';

type HeaderNotificationDropdownProps = {
  isGlass?: boolean;
  isHomePage?: boolean;
  isLoading?: boolean;
};

const CATEGORY_ICON: Record<NotificationCategory, typeof Bell> = {
  contest: Trophy,
  grading: Sparkles,
  marketing: Gift,
  result: Check,
  system: Megaphone,
};

function formatNotificationTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (elapsedSeconds < 60) return 'Just now';
  if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)}m ago`;
  if (elapsedSeconds < 86_400) return `${Math.floor(elapsedSeconds / 3600)}h ago`;
  if (elapsedSeconds < 604_800) return `${Math.floor(elapsedSeconds / 86_400)}d ago`;

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

function getSafeDeeplink(deeplink: string | null) {
  if (!deeplink) return null;

  try {
    const url = new URL(deeplink, window.location.origin);
    return url.origin === window.location.origin ? `${url.pathname}${url.search}${url.hash}` : null;
  } catch {
    return deeplink.startsWith('/') ? deeplink : null;
  }
}

function NotificationRow({
  item,
  onRead,
}: {
  item: NotificationItem;
  onRead: (item: NotificationItem) => void;
}) {
  const Icon = CATEGORY_ICON[item.category];
  const isUnread = !item.readAt;

  return (
    <button
      type="button"
      onClick={() => onRead(item)}
      className={cn(
        'group relative flex w-full gap-3 rounded-xl px-3 py-3 text-left outline-none transition-colors',
        'hover:bg-[#ededed] focus-visible:ring-2 focus-visible:ring-black/15 dark:hover:bg-white/8 dark:focus-visible:ring-white/20',
        isUnread && 'bg-white dark:bg-white/[0.045]'
      )}
    >
      <span
        className={cn(
          'mt-0.5 grid size-9 shrink-0 place-items-center rounded-full',
          isUnread
            ? 'bg-[#fff0ec] text-[#ff502d] dark:bg-[#ff502d]/15'
            : 'bg-black/5 text-black/55 dark:bg-white/8 dark:text-white/55'
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-2">
          <span
            className={cn(
              'min-w-0 flex-1 text-sm leading-5 text-black/90 dark:text-white/90',
              isUnread && 'font-semibold text-black dark:text-white'
            )}
          >
            {item.title}
          </span>
          {isUnread && (
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#ff502d]" aria-label="Unread" />
          )}
        </span>
        {item.body && (
          <span className="mt-0.5 block line-clamp-2 text-xs leading-[1.15rem] text-black/58 dark:text-white/58">
            {item.body}
          </span>
        )}
        <span className="mt-1 block text-[11px] font-medium text-black/42 dark:text-white/42">
          {formatNotificationTime(item.createdAt)}
        </span>
      </span>
    </button>
  );
}

export function HeaderNotificationDropdown({
  isGlass = false,
  isHomePage = false,
  isLoading = false,
}: HeaderNotificationDropdownProps) {
  const { resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const notificationsQuery = useNotificationsQuery(onlyUnread, isOpen || !onlyUnread);
  const allNotificationsQuery = useNotificationsQuery(false);
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();
  const items = useMemo(
    () => notificationsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [notificationsQuery.data]
  );
  const unreadCount = allNotificationsQuery.data?.pages[0]?.unreadCount ?? 0;
  const useHomeOverlayTone = isGlass && isHomePage;
  const useLightGlassTone = isGlass && !isHomePage && resolvedTheme !== 'dark';
  const bellIconClassName = cn(
    'relative z-10 size-5 -translate-y-px stroke-[2.1]',
    useHomeOverlayTone || (isGlass && !useLightGlassTone)
      ? 'text-white/92 stroke-white/92'
      : 'text-black stroke-black dark:text-white dark:stroke-white'
  );
  const badgeClassName = useHomeOverlayTone
    ? 'absolute -right-0.5 -top-0.5 z-20 grid min-w-[1.35rem] h-[1.35rem] place-items-center rounded-full bg-[#ff502d] px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-[#1f2730] pointer-events-none'
    : 'absolute -right-0.5 -top-0.5 z-20 grid min-w-[1.35rem] h-[1.35rem] place-items-center rounded-full bg-[#ff502d] px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white pointer-events-none dark:ring-[#141414]';

  const handleNotificationClick = async (item: NotificationItem) => {
    const deeplink = getSafeDeeplink(item.deeplink);

    if (!item.readAt) {
      try {
        await markReadMutation.mutateAsync(item.id);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Notification could not be updated.');
      }
    }

    if (deeplink) {
      setIsOpen(false);
      window.location.assign(deeplink);
    }
  };

  const handleMarkAllRead = () => {
    if (!unreadCount || markAllReadMutation.isPending) return;

    markAllReadMutation.mutate(undefined, {
      onError: (error) => toast.error(error.message),
    });
  };

  if (isLoading) {
    return (
      <div className="relative size-10 shrink-0">
        <div
          className={cn(
            'relative flex size-full items-center justify-center rounded-full shadow-none',
            useHomeOverlayTone
              ? 'border-0 bg-black/30 backdrop-blur-2xl'
              : [PRACTICE_HEADER_RING_CLASS, isHomePage ? 'after:!bg-[#141414]' : 'dark:after:bg-[#1a1a1a]']
          )}
        >
          <div
            className={cn(
              'h-5 w-4 animate-pulse rounded-full',
              useHomeOverlayTone ? 'bg-white/12' : 'bg-black/8 dark:bg-white/10'
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative size-10 shrink-0">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'relative flex size-full items-center justify-center rounded-full shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] transition-colors dark:shadow-none',
              useHomeOverlayTone
                ? 'border-0 bg-black/30 text-white/92 backdrop-blur-2xl hover:bg-black/36'
                : isGlass
                  ? [
                      PRACTICE_HEADER_RING_CLASS,
                      'text-black/85 hover:after:bg-stone-100 dark:text-white/85 dark:after:bg-[#1a1a1a] dark:hover:after:bg-[#1a1a1a]',
                    ]
                  : [
                      PRACTICE_HEADER_RING_CLASS,
                      isHomePage
                        ? 'text-white/85 after:!bg-[#141414] hover:after:!bg-[#1a1a1a]'
                        : 'text-black/85 hover:after:bg-stone-100 dark:text-white/85 dark:hover:after:bg-[#1a1a1a]',
                    ]
            )}
            aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          >
            <Bell className={bellIconClassName} />
          </button>
        </DropdownMenuTrigger>

        {unreadCount > 0 && (
          <span className={badgeClassName}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </div>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(380px,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-black/5 bg-[#f7f7f7] p-0 text-sm text-black shadow-[0_20px_45px_rgba(15,23,42,0.16)] dark:border-white/8 dark:bg-[#141414] dark:text-white dark:shadow-[0_20px_45px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4">
          <div>
            <p className="text-base font-semibold tracking-[-0.02em] text-black dark:text-white">
              Notifications
            </p>
            <p className="mt-0.5 text-xs text-black/50 dark:text-white/50">
              {unreadCount ? `${unreadCount} unread` : 'You are all caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#e94828] outline-none transition-colors hover:bg-[#ff502d]/8 focus-visible:ring-2 focus-visible:ring-[#ff502d]/25 disabled:opacity-50"
            >
              {markAllReadMutation.isPending ? 'Marking...' : 'Mark all read'}
            </button>
          )}
        </div>

        <div className="flex gap-1 px-4 pb-3">
          {[
            { label: 'All', value: false },
            { label: 'Unread', value: true },
          ].map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setOnlyUnread(filter.value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-black/15 dark:focus-visible:ring-white/20',
                onlyUnread === filter.value
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-black/5 text-black/60 hover:bg-black/8 dark:bg-white/8 dark:text-white/60 dark:hover:bg-white/12'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <DropdownMenuSeparator className="m-0 bg-black/7 dark:bg-white/9" />

        {notificationsQuery.isPending ? (
          <div
            className="flex min-h-52 items-center justify-center"
            aria-label="Loading notifications"
            role="status"
          >
            <span className="size-10 animate-spin rounded-full border-[3px] border-[#ffb347]/20 border-t-[#ffb347]" />
          </div>
        ) : notificationsQuery.isError ? (
          <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
            <span className="grid size-11 place-items-center rounded-full bg-red-500/10 text-red-500">
              <CircleAlert className="size-5" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-semibold">Notifications could not be loaded</p>
            <button
              type="button"
              onClick={() => notificationsQuery.refetch()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-black"
            >
              <RefreshCw className="size-3.5" />
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-black/5 text-black/45 dark:bg-white/8 dark:text-white/45">
              {onlyUnread ? <Check className="size-5" /> : <BellOff className="size-5" />}
            </span>
            <p className="mt-3 text-sm font-semibold">
              {onlyUnread ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="mt-1 max-w-56 text-xs leading-5 text-black/50 dark:text-white/50">
              {onlyUnread
                ? 'New notifications will appear here when they arrive.'
                : 'Updates about results, contests and your account will appear here.'}
            </p>
          </div>
        ) : (
          <>
            <div className="max-h-[min(420px,calc(100vh-220px))] overflow-y-auto">
              <div className="space-y-1 p-2">
                {items.map((item) => (
                  <NotificationRow key={item.id} item={item} onRead={handleNotificationClick} />
                ))}
              </div>
            </div>

            {notificationsQuery.hasNextPage && (
              <>
                <DropdownMenuSeparator className="m-0 bg-black/7 dark:bg-white/9" />
                <button
                  type="button"
                  onClick={() => notificationsQuery.fetchNextPage()}
                  disabled={notificationsQuery.isFetchingNextPage}
                  className="flex w-full items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold text-black/65 transition-colors hover:bg-black/4 disabled:opacity-50 dark:text-white/65 dark:hover:bg-white/5"
                >
                  {notificationsQuery.isFetchingNextPage ? 'Loading...' : 'Load more'}
                  {!notificationsQuery.isFetchingNextPage && <ChevronDown className="size-3.5" />}
                </button>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
