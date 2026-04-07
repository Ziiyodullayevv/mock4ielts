'use client';

import { useQuery } from '@tanstack/react-query';

import { getWritingSectionAttemptResult } from '../api/writing-attempt-api';

export function useWritingSectionResultQuery(
  sectionId: string,
  attemptId: string | null,
  enabled = true
) {
  return useQuery({
    enabled: Boolean(sectionId) && Boolean(attemptId) && enabled,
    queryFn: () =>
      getWritingSectionAttemptResult({
        attemptId: attemptId ?? '',
        sectionId,
      }),
    queryKey: ['published-sections', 'writing', sectionId, 'result', attemptId],
  });
}
