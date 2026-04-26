'use client';

import { useQuery } from '@tanstack/react-query';

import { listMockExams } from '../api/mock-exams-api';

export function useMockExamsQuery(enabled: boolean) {
  return useQuery({
    enabled,
    queryFn: () => listMockExams(),
    queryKey: ['mock-exams', 'list'],
    staleTime: 1000 * 60,
  });
}
