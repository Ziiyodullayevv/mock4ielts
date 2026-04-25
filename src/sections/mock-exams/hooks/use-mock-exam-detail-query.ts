'use client';

import { useQuery } from '@tanstack/react-query';

import { getMockExamDetail } from '../api/mock-exams-api';

export function useMockExamDetailQuery(examId: string | null, enabled: boolean) {
  return useQuery({
    enabled: Boolean(examId) && enabled,
    queryFn: () => getMockExamDetail(examId ?? ''),
    queryKey: ['mock-exams', 'detail', examId],
    staleTime: 1000 * 60,
  });
}
