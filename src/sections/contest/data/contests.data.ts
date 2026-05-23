import type { ContestItem } from '../types';

export const CONTEST_CUP_IMAGE =
  '/assets/contest/winner-cup.webp';

export const CONTESTS: ContestItem[] = [
  {
    id: 'weekly-500',
    title: 'Weekly Contest 500',
    description: 'A timed IELTS-style contest with leaderboard scoring and bonus rewards.',
    slug: '/contest/weekly-contest-500/',
    startsAt: '2026-05-03T02:30:00.000Z',
    endsAt: '2026-05-03T04:00:00.000Z',
    imageUrl: 'https://assets.leetcode.com/contest-config/contest/wc_card_img.png',
    gradient: 'linear-gradient(249deg, #F6D36F 0%, #D26F3A 100%)',
    width: 400,
    height: 250,
  },
  {
    id: 'biweekly-182',
    title: 'Biweekly Contest 182',
    description: 'A longer IELTS contest round for practicing accuracy under pressure.',
    slug: '/contest/biweekly-contest-182/',
    startsAt: '2026-05-09T14:30:00.000Z',
    endsAt: '2026-05-09T16:00:00.000Z',
    imageUrl: 'https://assets.leetcode.com/contest-config/contest/bc_card_img.png',
    gradient: 'linear-gradient(248deg, #937FE1 0%, #251B80 100.68%)',
    width: 350,
    height: 230,
  },
];
