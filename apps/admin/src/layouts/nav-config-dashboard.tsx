import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  contest: icon('ic-calendar'),
  section: icon('ic-course'),
  mockExam: icon('ic-invoice'),
  user: icon('ic-user'),
  dashboard: icon('ic-dashboard'),
};

// ----------------------------------------------------------------------

export const navData: NavSectionProps['data'] = [
  {
    subheader: 'Overview',
    items: [
      {
        title: 'Dashboard',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
      },
    ],
  },
  {
    subheader: 'Management',
    items: [
      {
        title: 'User',
        path: paths.dashboard.users.root,
        icon: ICONS.user,
        children: [
          {
            title: 'All users',
            path: paths.dashboard.users.root,
          },
          {
            title: 'New user',
            path: paths.dashboard.users.new,
          },
        ],
      },
      {
        title: 'Section bank',
        path: paths.dashboard.sections.root,
        icon: ICONS.section,
        children: [
          {
            title: 'All sections',
            path: paths.dashboard.sections.root,
          },
          {
            title: 'New section',
            path: paths.dashboard.sections.new,
          },
        ],
      },
      {
        title: 'Mock exams',
        path: paths.dashboard.mockExams.root,
        icon: ICONS.mockExam,
        children: [
          {
            title: 'All mock exams',
            path: paths.dashboard.mockExams.root,
          },
          {
            title: 'New mock exam',
            path: paths.dashboard.mockExams.new,
          },
        ],
      },
      {
        title: 'Contests',
        path: paths.dashboard.contests.root,
        icon: ICONS.contest,
        children: [
          {
            title: 'All contests',
            path: paths.dashboard.contests.root,
          },
          {
            title: 'New contest',
            path: paths.dashboard.contests.new,
          },
        ],
      },
    ],
  },
  {
    subheader: 'Account',
    items: [
      {
        title: 'Profile',
        path: paths.dashboard.profile,
        icon: ICONS.user,
      },
    ],
  },
];
