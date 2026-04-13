'use client';

import { useQuery } from '@tanstack/react-query';

import { getSpeakingSectionDetail } from '../api/get-speaking-section-detail';

export function useSpeakingSectionDetailQuery(sectionId: string, enabled = true) {
  return useQuery({
    enabled: Boolean(sectionId) && enabled,
    queryFn: () => getSpeakingSectionDetail(sectionId),
    queryKey: ['published-sections', 'speaking', sectionId],
  });
}
