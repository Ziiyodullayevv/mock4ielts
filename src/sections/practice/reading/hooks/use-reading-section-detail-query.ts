'use client';

import { useQuery } from '@tanstack/react-query';

import { getReadingSectionDetail } from '../api/get-reading-section-detail';

export function useReadingSectionDetailQuery(sectionId: string, enabled = true) {
  return useQuery({
    enabled: Boolean(sectionId) && enabled,
    queryFn: () => getReadingSectionDetail(sectionId),
    queryKey: ['published-sections', 'reading', sectionId],
  });
}
