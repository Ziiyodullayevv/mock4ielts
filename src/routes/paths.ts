const ROOTS = {
  PRACTICE: '/practice',
};

export const paths = {
  profile: {
    root: '/my-profile',
  },
  practice: {
    listening: {
      root: `${ROOTS.PRACTICE}/listening`,
      details: (id: string) => `${ROOTS.PRACTICE}/listening/${id}`,
    },
    reading: {
      root: `${ROOTS.PRACTICE}/reading`,
      details: (id: string) => `${ROOTS.PRACTICE}/reading/${id}`,
    },
    writing: {
      root: `${ROOTS.PRACTICE}/writing`,
      details: (id: string) => `${ROOTS.PRACTICE}/writing/${id}`,
    },
    speaking: {
      root: `${ROOTS.PRACTICE}/speaking`,
      details: (id: string) => `${ROOTS.PRACTICE}/speaking/${id}`,
    },
  },
  mockExam: {
    root: '/mock-exams',
  },
  contest: {
    root: '/contest',
  },
};
