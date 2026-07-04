import type { SubscriptionFaq } from '@/src/sections/subscription/types/subscription';

export const SUBSCRIPTION_FAQS: SubscriptionFaq[] = [
  {
    question: 'What do tokens cover in Mock4IELTS?',
    answer:
      'Tokens are used for AI-powered actions across the platform, including mock exam workflows, speaking follow-ups, writing feedback, and advanced review tools. Heavier workflows consume more tokens than simple result lookups.',
  },
  {
    question: 'Does yearly billing change my monthly token allowance?',
    answer:
      'No. Yearly billing lowers the effective monthly price, but the token allowance still refreshes monthly according to your selected plan.',
  },
  {
    question: 'Do unused subscribed tokens roll over?',
    answer:
      'No. Subscribed monthly tokens are meant for the active billing cycle only. If you are preparing intensely, yearly billing is usually the better value.',
  },
  {
    question: 'Can I switch between monthly and yearly later?',
    answer:
      'This page is a UI-first release, so billing actions are not wired yet. The layout is prepared for that flow, and plan switching logic can be added later without redesigning the page.',
  },
  {
    question: 'Will these plans affect my saved history and progress tracking?',
    answer:
      'Yes. Higher plans unlock more generous AI usage and deeper feedback, but your account history, saved attempts, and progress records stay tied to your Mock4IELTS profile.',
  },
];
