// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    profile: `${ROOTS.DASHBOARD}/profile`,
    users: {
      root: `${ROOTS.DASHBOARD}/users`,
      new: `${ROOTS.DASHBOARD}/users/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/users/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/users/${id}/edit`,
    },
    sections: {
      root: `${ROOTS.DASHBOARD}/sections`,
      new: `${ROOTS.DASHBOARD}/sections/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/sections/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/sections/${id}/edit`,
    },
    mockExams: {
      root: `${ROOTS.DASHBOARD}/mock-exams`,
      new: `${ROOTS.DASHBOARD}/mock-exams/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/mock-exams/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/mock-exams/${id}/edit`,
    },
    contests: {
      root: `${ROOTS.DASHBOARD}/contests`,
      new: `${ROOTS.DASHBOARD}/contests/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/contests/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/contests/${id}/edit`,
    },
  },
};
