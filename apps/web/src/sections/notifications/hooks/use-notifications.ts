'use client';

import type { InfiniteData } from '@tanstack/react-query';
import type { NotificationList } from '../api/notification-api';

import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../api/notification-api';

const PAGE_SIZE = 8;

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  list: (onlyUnread: boolean) => ['notifications', 'list', { onlyUnread }] as const,
};

function updateNotificationPages(
  data: InfiniteData<NotificationList> | undefined,
  notificationId?: string
) {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((item) =>
        !item.readAt && (!notificationId || item.id === notificationId)
          ? { ...item, readAt: new Date().toISOString() }
          : item
      ),
      unreadCount: notificationId ? Math.max(0, page.unreadCount - 1) : 0,
    })),
  };
}

export function useNotificationsQuery(onlyUnread: boolean, enabled = true) {
  return useInfiniteQuery<
    NotificationList,
    Error,
    InfiniteData<NotificationList>,
    ReturnType<typeof notificationQueryKeys.list>,
    number
  >({
    enabled,
    getNextPageParam: (lastPage, pages) => {
      const loadedCount = pages.reduce((total, page) => total + page.items.length, 0);
      return loadedCount < lastPage.total ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      listNotifications({
        onlyUnread,
        page: pageParam,
        size: PAGE_SIZE,
      }),
    queryKey: notificationQueryKeys.list(onlyUnread),
    staleTime: 30_000,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationQueryKeys.all });
      const previousAll = queryClient.getQueryData<InfiniteData<NotificationList>>(
        notificationQueryKeys.list(false)
      );
      const previousUnread = queryClient.getQueryData<InfiniteData<NotificationList>>(
        notificationQueryKeys.list(true)
      );

      queryClient.setQueryData(
        notificationQueryKeys.list(false),
        updateNotificationPages(previousAll, notificationId)
      );
      queryClient.setQueryData<InfiniteData<NotificationList>>(
        notificationQueryKeys.list(true),
        (data) => {
          if (!data) return data;

          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.filter((item) => item.id !== notificationId),
              total: Math.max(0, page.total - 1),
              unreadCount: Math.max(0, page.unreadCount - 1),
            })),
          };
        }
      );

      return { previousAll, previousUnread };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previousAll) {
        queryClient.setQueryData(notificationQueryKeys.list(false), context.previousAll);
      }
      if (context?.previousUnread) {
        queryClient.setQueryData(notificationQueryKeys.list(true), context.previousUnread);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all }),
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationQueryKeys.all });
      const previousAll = queryClient.getQueryData<InfiniteData<NotificationList>>(
        notificationQueryKeys.list(false)
      );
      const previousUnread = queryClient.getQueryData<InfiniteData<NotificationList>>(
        notificationQueryKeys.list(true)
      );

      queryClient.setQueryData(
        notificationQueryKeys.list(false),
        updateNotificationPages(previousAll)
      );
      queryClient.setQueryData<InfiniteData<NotificationList>>(
        notificationQueryKeys.list(true),
        (data) =>
          data
            ? {
                ...data,
                pages: data.pages.map((page) => ({
                  ...page,
                  items: [],
                  total: 0,
                  unreadCount: 0,
                })),
              }
            : data
      );

      return { previousAll, previousUnread };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousAll) {
        queryClient.setQueryData(notificationQueryKeys.list(false), context.previousAll);
      }
      if (context?.previousUnread) {
        queryClient.setQueryData(notificationQueryKeys.list(true), context.previousUnread);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all }),
  });
}
