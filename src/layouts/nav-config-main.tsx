import { paths } from '@/src/routes/paths';

type HeaderPanelItem = {
  href: string;
  label: string;
};

type HeaderItem = {
  href: string;
  id: string;
  label: string;
  matchPaths?: string[];
  panelItems?: HeaderPanelItem[];
};

export const HEADER_ITEMS: HeaderItem[] = [
  { href: paths.mockExam.root, id: 'mock-exams', label: 'Mock Exams' },
  {
    href: paths.practice.listening.root,
    id: 'practice',
    label: 'Practice',
    matchPaths: [
      paths.practice.listening.root,
      paths.practice.reading.root,
      paths.practice.speaking.root,
      paths.practice.writing.root,
    ],
    panelItems: [
      { href: paths.practice.listening.root, label: 'Listening Practice' },
      { href: paths.practice.reading.root, label: 'Reading Practice' },
      { href: paths.practice.writing.root, label: 'Writing Practice' },
      { href: paths.practice.speaking.root, label: 'Speaking Practice' },
    ],
  },
  { href: paths.contest.root, id: 'contest', label: 'Contest' },
];
