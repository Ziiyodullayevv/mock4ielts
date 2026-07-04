'use client';

import type { FavoriteListResult } from '../api/favorites-api';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toggleFavorite } from '../api/favorites-api';
import { favoriteQueryKeys } from './use-favorite-ids-query';

function buildOptimisticFavorites(
  current: FavoriteListResult | undefined,
  sectionId: string,
  shouldInclude: boolean
): FavoriteListResult {
  const currentItems = current?.items ?? [];
  const nextItems = shouldInclude
    ? currentItems.some((item) => item.sectionId === sectionId)
      ? currentItems
      : [
          {
            createdAt: new Date().toISOString(),
            id: `optimistic-${sectionId}`,
            sectionId,
          },
          ...currentItems,
        ]
    : currentItems.filter((item) => item.sectionId !== sectionId);

  return {
    items: nextItems,
    pagination: {
      page: current?.pagination.page ?? 1,
      pages: current?.pagination.pages ?? 1,
      size: current?.pagination.size ?? 100,
      total: nextItems.length,
    },
  };
}

export function useFavoriteToggleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFavorite,
    onError: (_error, _sectionId, context) => {
      queryClient.setQueryData(favoriteQueryKeys.list, context?.previous);
    },
    onMutate: async (sectionId: string) => {
      await queryClient.cancelQueries({ queryKey: favoriteQueryKeys.list });

      const previous = queryClient.getQueryData<FavoriteListResult>(favoriteQueryKeys.list);
      const isCurrentlyFavorited =
        previous?.items.some((item) => item.sectionId === sectionId) ?? false;

      queryClient.setQueryData(
        favoriteQueryKeys.list,
        buildOptimisticFavorites(previous, sectionId, !isCurrentlyFavorited)
      );

      return { previous };
    },
    onSuccess: (result, sectionId) => {
      queryClient.setQueryData<FavoriteListResult | undefined>(
        favoriteQueryKeys.list,
        (current) => buildOptimisticFavorites(current, sectionId, result.added)
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.list });
    },
  });
}
