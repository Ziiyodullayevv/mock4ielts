'use client';

import { useQuery } from '@tanstack/react-query';

import { listPublishedSpeakingSections } from '../api/list-published-speaking-sections';

export function useSpeakingSectionsQuery() {
  return useQuery({
    queryFn: listPublishedSpeakingSections,
    queryKey: ['published-sections', 'speaking'],
  });
}
