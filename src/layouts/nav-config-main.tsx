type HeaderItem = {
  href: string;
  id: string;
  label: string;
  panelItems?: string[];
};

export const HEADER_ITEMS: HeaderItem[] = [
  {
    href: '#',
    id: 'question-bank',
    label: 'Question Bank',
  },
  {
    href: '#',
    id: 'practice',
    label: 'Practice',
    panelItems: [
      'Listening Practice',
      'Reading Practice',
      'Writing Practice',
      'Speaking Practice',
    ],
  },
  { href: '#', id: 'mock-exams', label: 'Mock Exams' },
  { href: '#', id: 'contest', label: 'Contest' },
];
