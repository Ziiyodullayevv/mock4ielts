import type { BenefitItem } from '../types';

import { Brain, Timer, TrendingUp } from 'lucide-react';

export const benefits: BenefitItem[] = [
  {
    title: 'Smart IELTS',
    highlight: 'Practice',
    description:
      'Practice real IELTS questions across Listening, Reading, Writing, and Speaking sections.',
    icon: <Brain />,
  },
  {
    title: 'Real Exam',
    highlight: 'Mock Tests',
    description:
      'Experience realistic IELTS mock exams with timed sections and authentic question formats.',
    icon: <Timer />,
  },
  {
    title: 'Track Your',
    highlight: 'Progress',
    description:
      'Monitor your performance, completed tasks, and improvement toward your target band score.',
    icon: <TrendingUp />,
  },
];
