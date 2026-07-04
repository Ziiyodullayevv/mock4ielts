'use client';

import { useQuery } from '@tanstack/react-query';

import { listPublishedListeningSections } from '../api/list-published-listening-sections';

export function useListeningSectionsQuery() {
  return useQuery({
    queryFn: listPublishedListeningSections,
    queryKey: ['published-sections', 'listening'],
  });
}
