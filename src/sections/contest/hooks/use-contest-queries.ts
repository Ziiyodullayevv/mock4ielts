'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getContest,
  listContests,
  startContest,
  registerContest,
  getMyContestStats,
  getContestLeaderboard,
} from '../api/contest-api';

type ContestListParams = Parameters<typeof listContests>[0];

export function useContestsQuery(params: ContestListParams = {}) {
  return useQuery({
    queryFn: () => listContests(params),
    queryKey: ['contests', 'list', params],
    staleTime: 1000 * 60,
  });
}

export function useContestQuery(contestId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(contestId),
    queryFn: () => getContest(contestId),
    queryKey: ['contests', 'details', contestId],
    staleTime: 1000 * 60,
  });
}

export function useContestLeaderboardQuery(contestId?: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(contestId),
    queryFn: () => getContestLeaderboard(contestId!),
    queryKey: ['contests', 'leaderboard', contestId],
    staleTime: 1000 * 60,
  });
}

export function useMyContestStatsQuery(enabled: boolean) {
  return useQuery({
    enabled,
    queryFn: getMyContestStats,
    queryKey: ['statistics', 'me', 'contests'],
    staleTime: 1000 * 60 * 5,
  });
}

export function useRegisterContestMutation(contestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => registerContest(contestId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['contests'] }),
        queryClient.invalidateQueries({ queryKey: ['statistics', 'me', 'contests'] }),
      ]);
    },
  });
}

export function useStartContestMutation(contestId: string) {
  return useMutation({
    mutationFn: () => startContest(contestId),
  });
}
