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
    },
    writing: {
      root: `${ROOTS.PRACTICE}/writing`,
    },
    speaking: {
      root: `${ROOTS.PRACTICE}/speaking`,
    },
  },
  mockExam: {
    root: '/mock-exams',
  },
  contest: {
    root: '/contest',
  },
};
