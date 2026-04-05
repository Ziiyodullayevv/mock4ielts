'use client';

import { useQuery } from '@tanstack/react-query';

import { getMyProfile } from '../api/profile-api';

export function useMyProfileQuery(enabled: boolean) {
  return useQuery({
    enabled,
    queryFn: getMyProfile,
    queryKey: ['auth', 'me'],
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}
