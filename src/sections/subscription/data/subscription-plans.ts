import type { SubscriptionPlan } from '@/src/sections/subscription/types/subscription';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    accentPanelClassName:
      'border border-stone-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.92)_0%,rgba(241,245,249,0.96)_100%)] dark:border-white/8 dark:bg-none dark:bg-[#1b2430]',
    accentTextClassName: 'text-stone-950 dark:text-white',
    borderClassName: 'border-stone-200 dark:border-white/14',
    buttonClassName:
      'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-white/[0.12] dark:text-white dark:hover:bg-white/[0.16]',
    buttonLabel: 'Current Plan',
    buttonNote: 'Start here and upgrade any time',
    description: 'For getting started with Mock4IELTS and trying the core practice flow.',
    features: [
      '100 tokens every month',
      'Up to 1 full mock exam monthly',
      'Basic writing and speaking AI review',
      'Access to reading and listening practice sets',
      'Saved score history for recent attempts',
    ],
    hoverBorderClassName: 'hover:border-stone-300 dark:hover:border-white/24',
    id: 'free',
    monthlyCredits: 100,
    monthlyVideosEquivalent: 'Practice enough for 1 full mock exam cycle',
    name: 'Free',
    notes: ['Best for exploring the platform before moving to a paid plan.'],
    prices: {
      subscription_monthly: {
        amount: 0,
        billingNote: 'Always free',
      },
      subscription_yearly: {
        amount: 0,
        billingNote: 'Always free',
      },
    },
  },
  {
    accentPanelClassName:
      'border border-[#d7e7fb] bg-[linear-gradient(180deg,rgba(208,232,255,0.38)_0%,rgba(238,245,255,0.95)_100%)] dark:border-[#79A4FF]/16 dark:bg-none dark:bg-[rgba(56,84,132,0.34)]',
    accentTextClassName:
      'text-[#79A4FF] dark:bg-[linear-gradient(90deg,#CFE7FF_0%,#79A4FF_100%)] dark:bg-clip-text dark:text-transparent',
    badge: 'Most balanced',
    borderClassName: 'border-[#d7dfea] dark:border-white/18',
    buttonClassName: 'bg-[linear-gradient(90deg,#b7d8ff_0%,#6f9dff_100%)] text-black',
    description: 'For focused weekly practice across all four IELTS skills.',
    features: [
      '800 tokens every month',
      'Up to 8 full mock exams monthly',
      'AI writing feedback with band-style suggestions',
      'Speaking follow-up prompts and session summaries',
      'Reading and listening review breakdowns',
      'Priority practice queue during busy hours',
      'Download results and keep history synced',
    ],
    hoverBorderClassName: 'hover:border-[#79A4FE]',
    highlight: true,
    highlightClassName:
      'shadow-[0_0_0_1px_rgba(111,157,255,0.30),0_24px_60px_rgba(111,157,255,0.18),rgba(255,255,255,0.45)_1.2px_1.5px_0px_0px_inset,rgba(111,157,255,0.20)_0px_0px_14px_0px_inset] dark:shadow-[0_0_0_1px_rgba(121,164,255,0.34),0_0_44px_rgba(111,157,255,0.24),rgba(255,255,255,0.16)_1px_1px_0px_0px_inset]',
    id: 'standard',
    monthlyCredits: 800,
    monthlyVideosEquivalent: 'Practice enough for 8 full mock exam cycles',
    name: 'Standard',
    prices: {
      subscription_monthly: {
        amount: 12,
        billingNote: 'Billed monthly',
      },
      subscription_yearly: {
        amount: 8,
        billingNote: 'Billed yearly as $96',
        caption: '33% lower than monthly billing',
      },
    },
  },
  {
    accentPanelClassName:
      'border border-[#efe2b6] bg-[linear-gradient(180deg,rgba(248,238,197,0.40)_0%,rgba(252,248,235,0.96)_100%)] dark:border-[#BDA16C]/16 dark:bg-none dark:bg-[rgba(94,76,41,0.34)]',
    accentTextClassName:
      'text-[#b4944f] dark:bg-[linear-gradient(91deg,#FAF1C8_3.96%,#BDA16C_96.78%)] dark:bg-clip-text dark:text-transparent',
    borderClassName: 'border-[#eadfb8] dark:border-white/18',
    buttonClassName: 'bg-[linear-gradient(90deg,#f8ebb0_0%,#c6a55d_100%)] text-black',
    description: 'For students who want stronger feedback loops and more token room.',
    features: [
      '2500 tokens every month',
      'Up to 25 full mock exams monthly',
      'Deeper writing analysis with revision cues',
      'Extended speaking evaluation and fluency prompts',
      'More saved references for essay and vocabulary prep',
      'Faster queue access for AI-assisted scoring',
      'Commercial-free experience with richer reports',
    ],
    hoverBorderClassName: 'hover:border-[#BDA16C]',
    id: 'premium',
    monthlyCredits: 2500,
    monthlyVideosEquivalent: 'Practice enough for 25 full mock exam cycles',
    name: 'Premium',
    notes: ['Best for consistent band improvement across speaking and writing.'],
    prices: {
      subscription_monthly: {
        amount: 29,
        billingNote: 'Billed monthly',
      },
      subscription_yearly: {
        amount: 24,
        billingNote: 'Billed yearly as $288',
        caption: 'Save $60 per year',
      },
    },
  },
];
