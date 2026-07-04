export type SubscriptionPeriod = 'subscription_monthly' | 'subscription_yearly';

export type SubscriptionPrice = {
  amount: number;
  billingNote: string;
  caption?: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  badge?: string;
  buttonLabel?: string;
  buttonNote?: string;
  highlight?: boolean;
  highlightClassName?: string;
  accentTextClassName: string;
  accentPanelClassName: string;
  borderClassName: string;
  buttonClassName: string;
  hoverBorderClassName: string;
  monthlyCredits: number;
  monthlyVideosEquivalent: string;
  prices: Record<SubscriptionPeriod, SubscriptionPrice>;
  features: string[];
  notes?: string[];
};

export type SubscriptionFaq = {
  answer: string;
  question: string;
};
