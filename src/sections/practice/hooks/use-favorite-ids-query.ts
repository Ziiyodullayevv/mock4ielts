'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { listFavorites } from '../api/favorites-api';

export const favoriteQueryKeys = {
  all: ['favorites'] as const,
  list: ['favorites', 'list'] as const,
};

export function useFavoriteIdsQuery(enabled: boolean) {
  const query = useQuery({
    enabled,
    queryFn: listFavorites,
    queryKey: favoriteQueryKeys.list,
    retry: false,
    staleTime: 1000 * 60,
  });

  const favoriteIds = useMemo(
    () => new Set((query.data?.items ?? []).map((item) => item.sectionId)),
    [query.data?.items]
  );

  return {
    ...query,
    favoriteIds,
  };
}
