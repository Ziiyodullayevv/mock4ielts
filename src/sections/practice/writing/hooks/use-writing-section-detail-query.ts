'use client';

import { useQuery } from '@tanstack/react-query';

import { getWritingSectionDetail } from '../api/get-writing-section-detail';

export function useWritingSectionDetailQuery(sectionId: string, enabled = true) {
  return useQuery({
    enabled: Boolean(sectionId) && enabled,
    queryFn: () => getWritingSectionDetail(sectionId),
    queryKey: ['published-sections', 'writing', sectionId],
  });
}
