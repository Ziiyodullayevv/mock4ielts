'use client';

import { useQuery } from '@tanstack/react-query';

import { listPublishedReadingSections } from '../api/list-published-reading-sections';

export function useReadingSectionsQuery() {
  return useQuery({
    queryFn: listPublishedReadingSections,
    queryKey: ['published-sections', 'reading'],
  });
}
