const ROOTS = {
  PRACTICE: '/practice',
};

export const paths = {
  favorites: {
    root: '/favorites',
  },
  profile: {
    root: '/my-profile',
  },
  subscription: {
    root: '/my-subscription',
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
    details: (examId: string) => `/mock-exams/${examId}`,
    root: '/mock-exams',
  },
  contest: {
    root: '/contest',
  },
};
