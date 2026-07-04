import type { Metadata } from 'next';

import { CONFIG } from '@/src/global-config';
import { HomeView } from '@/src/sections/home/view';
import { buildPageMetadata } from '@/src/lib/metadata';
import { RouteProviders } from '@/src/components/providers/route-providers';

export const metadata: Metadata = buildPageMetadata({
  absoluteTitle: true,
  description:
    'Mock4IELTS — all-in-one IELTS preparation platform. Practice Listening, Reading, Writing, and Speaking with realistic exam-style tasks, full mock exams, and detailed progress tracking.',
  path: '/',
  title: `${CONFIG.appName} - Real IELTS Practice, Mock Exams & Progress Tracking`,
});

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Mock4IELTS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mock4IELTS is an all-in-one IELTS preparation platform that helps learners improve their Listening, Reading, Writing, and Speaking skills through realistic practice and full mock exams. It provides exam-style questions, progress tracking, and a structured path to build confidence before the real IELTS test.',
      },
    },
    {
      '@type': 'Question',
      name: 'What can I practice on Mock4IELTS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mock4IELTS covers all four IELTS sections: Listening practice with exam-style audio tasks and questions, Reading practice with timed passages and question types, Writing practice for Task 1 and Task 2 prompts, Speaking practice with cue cards and common interview topics, and full mock exams to simulate the real IELTS experience.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is Mock4IELTS different from a question bank?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A question bank gives access to isolated IELTS questions. Mock4IELTS combines section-focused practice with full-length mock exams and detailed progress tracking into one platform, so you can prepare more strategically and measure real improvement.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Mock4IELTS free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mock4IELTS offers free practice content for all four IELTS sections. Advanced features, full-length mock exams, and premium tools are available through paid plans.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I track my IELTS progress on Mock4IELTS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Mock4IELTS tracks your practice history, completed tasks, section scores, and overall band score improvement over time, so you always know where to focus your preparation.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why choose Mock4IELTS over other IELTS platforms?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mock4IELTS combines realistic exam simulation, structured section practice, live contests, and detailed progress analytics in one platform. The interface is designed to mirror the real IELTS test environment so you practice under conditions close to the actual exam.',
      },
    },
  ],
};

export default function Page() {
  return (
    <RouteProviders>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomeView />
    </RouteProviders>
  );
}
