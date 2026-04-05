'use client';

import type { ListeningTest } from '../types';

import { useQuery } from '@tanstack/react-query';

import { getListeningSectionAttemptResult } from '../api/listening-attempt-api';

export function useListeningSectionResultQuery(
  sectionId: string,
  attemptId: string | null,
  test: ListeningTest | undefined,
  enabled = true
) {
  return useQuery({
    enabled: Boolean(sectionId) && Boolean(attemptId) && Boolean(test) && enabled,
    queryFn: () =>
      getListeningSectionAttemptResult({
        attemptId: attemptId ?? '',
        sectionId,
        test: test!,
      }),
    queryKey: ['published-sections', 'listening', sectionId, 'result', attemptId],
  });
}
