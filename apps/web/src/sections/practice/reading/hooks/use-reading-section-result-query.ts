'use client';

import type { ReadingTest } from '../types';

import { useQuery } from '@tanstack/react-query';

import { getReadingSectionAttemptResult } from '../api/reading-attempt-api';

export function useReadingSectionResultQuery(
  sectionId: string,
  attemptId: string | null,
  test: ReadingTest | undefined,
  enabled = true
) {
  return useQuery({
    enabled: Boolean(sectionId) && Boolean(attemptId) && Boolean(test) && enabled,
    queryFn: () =>
      getReadingSectionAttemptResult({
        attemptId: attemptId ?? '',
        sectionId,
        test: test!,
      }),
    queryKey: ['published-sections', 'reading', sectionId, 'result', attemptId],
  });
}
