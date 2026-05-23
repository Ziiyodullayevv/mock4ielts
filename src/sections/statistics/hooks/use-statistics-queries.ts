'use client';

import { useQuery } from '@tanstack/react-query';

import {
  getMyStatistics,
  getMyExamStatistics,
  getMySectionStatistics,
  getGlobalSectionStatistics,
} from '../api/statistics-api';

export function useMyStatisticsQuery(enabled: boolean) {
  return useQuery({
    enabled,
    queryFn: getMyStatistics,
    queryKey: ['statistics', 'me'],
    staleTime: 1000 * 60 * 5,
  });
}

export function useMySectionStatisticsQuery(enabled: boolean) {
  return useQuery({
    enabled,
    queryFn: getMySectionStatistics,
    queryKey: ['statistics', 'me', 'sections'],
    staleTime: 1000 * 60 * 5,
  });
}

export function useMyExamStatisticsQuery(enabled: boolean) {
  return useQuery({
    enabled,
    queryFn: getMyExamStatistics,
    queryKey: ['statistics', 'me', 'exams'],
    staleTime: 1000 * 60 * 5,
  });
}

export function useGlobalSectionStatisticsQuery() {
  return useQuery({
    queryFn: getGlobalSectionStatistics,
    queryKey: ['statistics', 'global'],
    staleTime: 1000 * 60 * 30,
  });
}
