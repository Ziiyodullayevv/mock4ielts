'use client';

import { useQuery } from '@tanstack/react-query';

import { listPublishedWritingSections } from '../api/list-published-writing-sections';

export function useWritingSectionsQuery() {
  return useQuery({
    queryFn: listPublishedWritingSections,
    queryKey: ['published-sections', 'writing'],
  });
}
