import type { ContestItem, RankingUser, PastContestEntry } from '../types';

import { paths } from '@/src/routes/paths';
import { endpoints, axiosInstance } from '@/src/lib/axios';

type ApiEnvelope<T> = {
  data?: T | null;
  message?: string;
  pagination?: PaginationDto | null;
  success?: boolean;
};

type PaginationDto = {
  page: number;
  pages: number;
  size: number;
  total: number;
};

type ContestStatusDto = 'finished' | 'grading' | 'live' | 'scheduled';

type ContestListParams = {
  page?: number;
  q?: string;
  size?: number;
  status?: ContestStatusDto;
};

type ApiContestSection = {
  order?: number | null;
  section_id?: string | null;
  section_type?: string | null;
  title?: string | null;
  token_count?: number | null;
};

type ApiContest = {
  contest_status?: ContestStatusDto | null;
  description?: string | null;
  duration_minutes?: number | null;
  id?: string | null;
  image_url?: string | null;
  is_registered?: boolean | null;
  registration_deadline?: string | null;
  scheduled_at?: string | null;
  sections?: ApiContestSection[] | null;
  title?: string | null;
  total_token_count?: number | null;
};

type ApiLeaderboardEntry = {
  attended?: number | null;
  avatar?: string | null;
  avatar_url?: string | null;
  country?: string | null;
  full_name?: string | null;
  overall_band?: number | string | null;
  rank?: number | null;
  rating?: number | string | null;
  time_spent_seconds?: number | null;
  user_id?: string | null;
  username?: string | null;
};

type ApiLeaderboard = {
  contest_title?: string | null;
  leaderboard?: ApiLeaderboardEntry[] | null;
  my_rank?: number | null;
  total_participants?: number | null;
};

type ApiContestStats = {
  past_contests?: ApiPastContest[] | null;
  upcoming_contests?: ApiUpcomingContest[] | null;
};

type ApiPastContest = {
  id?: string | null;
  scheduled_at?: string | null;
  title?: string | null;
  total_participants?: number | null;
  user_overall_band?: number | null;
  user_rank?: number | null;
};

type ApiUpcomingContest = {
  duration_minutes?: number | null;
  id?: string | null;
  scheduled_at?: string | null;
  title?: string | null;
};

export type ContestListResult = {
  items: ContestItem[];
  pagination: PaginationDto;
};

export type ContestLeaderboardResult = {
  contestTitle: string;
  list: RankingUser[];
  myRank: number | null;
  podium: RankingUser[];
  totalParticipants: number;
};

export type MyContestStatsResult = {
  pastContests: PastContestEntry[];
  upcomingContests: ContestItem[];
};

const DEFAULT_PAGINATION: PaginationDto = {
  page: 1,
  pages: 1,
  size: 20,
  total: 0,
};

const DEFAULT_CONTEST_IMAGE = 'https://assets.leetcode.com/contest-config/contest/wc_card_img.png';
const DEFAULT_CONTEST_SECTION_TOKEN_COUNT = 3;
const DEFAULT_CONTEST_TOTAL_TOKEN_COUNT = 12;
const MAX_CONTEST_SECTION_TOKEN_COUNT = 3;
const MAX_CONTEST_TOTAL_TOKEN_COUNT = 12;

const CONTEST_GRADIENTS = [
  'linear-gradient(135deg,#7c2d12 0%,#f59e0b 100%)',
  'linear-gradient(135deg,#312e81 0%,#8b5cf6 100%)',
  'linear-gradient(135deg,#064e3b 0%,#2dd4bf 100%)',
];

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function normalizeTokenCount(value: unknown, fallback: number, maxValue: number) {
  const parsed = toNumber(value, fallback);

  if (parsed <= 0) {
    return fallback;
  }

  return Math.min(parsed, maxValue);
}

function toIsoDate(value?: string | null) {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function getContestEndsAt(startsAt: string, durationMinutes?: number | null) {
  const start = new Date(startsAt);
  const duration = typeof durationMinutes === 'number' && durationMinutes > 0 ? durationMinutes : 165;

  return new Date(start.getTime() + duration * 60 * 1000).toISOString();
}

function formatDate(value?: string | null) {
  const parsed = value ? new Date(value) : null;

  if (!parsed || Number.isNaN(parsed.getTime())) {
    return 'No date';
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

function getContestGradient(id: string) {
  const index = id
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % CONTEST_GRADIENTS.length;

  return CONTEST_GRADIENTS[index];
}

function mapContest(contest: ApiContest, index = 0): ContestItem {
  const id = contest.id ?? `contest-${index + 1}`;
  const startsAt = toIsoDate(contest.scheduled_at);

  return {
    contestStatus: contest.contest_status ?? undefined,
    description: contest.description ?? undefined,
    durationMinutes: contest.duration_minutes ?? undefined,
    endsAt: getContestEndsAt(startsAt, contest.duration_minutes),
    gradient: getContestGradient(id),
    height: 250,
    id,
    imageUrl: contest.image_url ?? DEFAULT_CONTEST_IMAGE,
    isRegistered: Boolean(contest.is_registered),
    sections: (contest.sections ?? []).map((section, sectionIndex) => ({
      id: section.section_id ?? `${id}-section-${sectionIndex + 1}`,
      order: section.order ?? sectionIndex,
      sectionType: section.section_type ?? 'section',
      title: section.title ?? `Section ${sectionIndex + 1}`,
      tokenCount: normalizeTokenCount(
        section.token_count,
        DEFAULT_CONTEST_SECTION_TOKEN_COUNT,
        MAX_CONTEST_SECTION_TOKEN_COUNT
      ),
    })),
    slug: paths.contest.details(id),
    startsAt,
    title: contest.title ?? `Contest ${index + 1}`,
    totalTokenCount: normalizeTokenCount(
      contest.total_token_count,
      DEFAULT_CONTEST_TOTAL_TOKEN_COUNT,
      MAX_CONTEST_TOTAL_TOKEN_COUNT
    ),
    width: 400,
  };
}

function mapPastContest(contest: ApiPastContest | ApiContest, index = 0): PastContestEntry {
  const id = contest.id ?? `past-contest-${index + 1}`;
  const score =
    'user_overall_band' in contest && typeof contest.user_overall_band === 'number'
      ? `${contest.user_overall_band.toFixed(1)} Band`
      : 'View';

  return {
    bannerUrl: DEFAULT_CONTEST_IMAGE,
    id,
    score,
    slug: paths.contest.details(id),
    startsAt: formatDate(contest.scheduled_at),
    title: contest.title ?? `Contest ${index + 1}`,
    totalParticipants:
      'total_participants' in contest && typeof contest.total_participants === 'number'
        ? contest.total_participants
        : undefined,
    userRank:
      'user_rank' in contest && typeof contest.user_rank === 'number' ? contest.user_rank : null,
  };
}

function getMedal(rank: number) {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return 'bronze';
  return undefined;
}

function mapRankingUser(entry: ApiLeaderboardEntry, index: number): RankingUser {
  const rank = entry.rank ?? index + 1;
  const displayName = entry.full_name || entry.username || `User ${rank}`;
  const rating = toNumber(entry.overall_band ?? entry.rating);

  return {
    attended: entry.attended ?? (entry.time_spent_seconds ? Math.round(entry.time_spent_seconds / 60) : 0),
    avatarUrl: entry.avatar_url || entry.avatar || '/logo/logo.svg',
    countryFlag: entry.country ?? undefined,
    displayName,
    medal: getMedal(rank),
    profileUrl: '#',
    rank,
    rating,
    username: entry.username || entry.user_id || `user-${rank}`,
  };
}

export async function listContests(params: ContestListParams = {}): Promise<ContestListResult> {
  const response = await axiosInstance.get<ApiEnvelope<ApiContest[]>>(endpoints.contests.list, {
    params: {
      page: params.page ?? 1,
      q: params.q,
      size: params.size ?? 20,
      status: params.status,
    },
  });

  const contests = response.data.data ?? [];

  return {
    items: contests.map(mapContest),
    pagination: response.data.pagination ?? DEFAULT_PAGINATION,
  };
}

export async function getContest(contestId: string): Promise<ContestItem> {
  const response = await axiosInstance.get<ApiEnvelope<ApiContest>>(endpoints.contests.details(contestId));
  const contest = response.data.data;

  if (!contest) {
    throw new Error('Contest not found.');
  }

  return mapContest(contest);
}

export async function registerContest(contestId: string) {
  await axiosInstance.post(endpoints.contests.register(contestId));
}

export async function startContest(contestId: string) {
  const response = await axiosInstance.post<ApiEnvelope<Record<string, unknown>>>(
    endpoints.contests.start(contestId)
  );

  return response.data.data ?? {};
}

export async function getContestLeaderboard(
  contestId: string,
  page = 1,
  size = 10
): Promise<ContestLeaderboardResult> {
  const response = await axiosInstance.get<ApiEnvelope<ApiLeaderboard>>(
    endpoints.contests.leaderboard(contestId),
    {
      params: { page, size },
    }
  );
  const data = response.data.data;
  const users = (data?.leaderboard ?? []).map(mapRankingUser);

  return {
    contestTitle: data?.contest_title ?? 'Contest leaderboard',
    list: users.filter((user) => user.rank > 3),
    myRank: data?.my_rank ?? null,
    podium: users.filter((user) => user.rank <= 3),
    totalParticipants: data?.total_participants ?? users.length,
  };
}

export async function getMyContestStats(): Promise<MyContestStatsResult> {
  const response = await axiosInstance.get<ApiEnvelope<ApiContestStats>>(endpoints.statistics.contests);
  const data = response.data.data;

  return {
    pastContests: (data?.past_contests ?? []).map(mapPastContest),
    upcomingContests: (data?.upcoming_contests ?? []).map((contest, index) =>
      mapContest(
        {
          contest_status: 'scheduled',
          duration_minutes: contest.duration_minutes,
          id: contest.id,
          scheduled_at: contest.scheduled_at,
          title: contest.title,
        },
        index
      )
    ),
  };
}
