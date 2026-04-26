import type { ContestItem } from '../types';

export const CONTEST_CUP_IMAGE =
  'https://leetcode.com/_next/static/images/Cup-d223fc8ae094b40ae00265a1f99b489f.png';

export const CONTESTS: ContestItem[] = [
  {
    id: 'weekly-498',
    title: 'Weekly Contest 498',
    slug: '/contest/weekly-contest-498/',
    startsAt: '2026-04-19T02:30:00.000Z',
    endsAt: '2026-04-19T04:00:00.000Z',
    imageUrl: 'https://assets.leetcode.com/contest-config/contest/wc_card_img.png',
    gradient: 'linear-gradient(249deg, #F6D36F 0%, #D26F3A 100%)',
    width: 400,
    height: 250,
  },
  {
    id: 'biweekly-181',
    title: 'Biweekly Contest 181',
    slug: '/contest/biweekly-contest-181/',
    startsAt: '2026-04-25T14:30:00.000Z',
    endsAt: '2026-04-25T16:00:00.000Z',
    imageUrl: 'https://assets.leetcode.com/contest-config/contest/bc_card_img.png',
    gradient: 'linear-gradient(248deg, #937FE1 0%, #251B80 100.68%)',
    width: 350,
    height: 230,
  },
];
