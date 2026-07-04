'use client';

import { useQuery } from '@tanstack/react-query';

import { getListeningSectionDetail } from '../api/get-listening-section-detail';

export function useListeningSectionDetailQuery(sectionId: string, enabled = true) {
  return useQuery({
    enabled: Boolean(sectionId) && enabled,
    queryFn: () => getListeningSectionDetail(sectionId),
    queryKey: ['published-sections', 'listening', sectionId],
  });
}
