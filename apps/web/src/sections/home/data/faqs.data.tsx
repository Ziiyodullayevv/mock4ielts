import type { FAQItem } from '../types/home.types';

import Link from 'next/link';

export const faqItems: FAQItem[] = [
  {
    question: 'What is Mock4IELTS?',
    answer: (
      <>
        <p className="py-3 text-[14px] leading-5 opacity-60">
          Mock4IELTS is an all-in-one IELTS preparation platform designed to help learners improve
          their Listening, Reading, Writing, and Speaking skills through realistic practice and full
          mock exams.
        </p>
        <p className="py-3 text-[14px] leading-5 opacity-60">
          It provides a structured way to practice exam-style questions, track your progress, and
          build confidence before taking the real IELTS test.
        </p>
      </>
    ),
  },
  {
    question: 'What can I practice on Mock4IELTS?',
    answer: (
      <>
        <p className="py-3 text-[14px] leading-5 opacity-60">
          Mock4IELTS helps you prepare for every main section of the IELTS exam:
        </p>

        <ul className="list-disc py-2 pl-4 text-[14px] leading-5 opacity-60">
          <li className="py-1">Listening practice with exam-style audio tasks and questions.</li>
          <li className="py-1">Reading practice with passages, question types, and timing.</li>
          <li className="py-1">Writing practice for Task 1 and Task 2 prompts.</li>
          <li className="py-1">Speaking practice with cue cards and common interview topics.</li>
          <li className="py-1">Full mock exams to simulate the real IELTS experience.</li>
        </ul>
      </>
    ),
  },
  {
    question: 'How is Mock4IELTS different from a question bank?',
    answer: (
      <>
        <p className="py-3 text-[14px] leading-5 opacity-60">
          A question bank gives you access to individual IELTS practice questions and topics that
          you can solve by section or type.
        </p>

        <p className="py-3 text-[14px] leading-5 opacity-60">
          Mock4IELTS goes further by combining question-based practice with section-focused
          training, full mock exams, and progress tracking, so you can prepare more strategically.
        </p>
      </>
    ),
  },
  {
    question: 'Is Mock4IELTS free to use?',
    answer: (
      <p className="py-3 text-[14px] leading-5 opacity-60">
        Mock4IELTS may include free practice content, while some advanced features, full mock exams,
        or premium tools can be available through paid plans.
      </p>
    ),
  },
  {
    question: 'Can I track my IELTS progress on Mock4IELTS?',
    answer: (
      <p className="py-3 text-[14px] leading-5 opacity-60">
        Yes. Mock4IELTS is designed to help you monitor your practice history, completed tasks,
        section performance, and overall improvement over time.
      </p>
    ),
  },
  {
    question: 'How can I get help if I have more questions?',
    answer: (
      <>
        <p className="py-3 text-[14px] leading-5 opacity-60">
          If you need more help, you can reach out through our support channels or visit the help
          center for additional guidance and answers.
        </p>

        <ul className="list-disc py-2 pl-4 text-sm leading-5 opacity-60">
          <li className="py-1">
            Visit our{' '}
            <Link href="/help-center" className="cursor-pointer underline">
              Help Center
            </Link>{' '}
            for support and common answers.
          </li>
        </ul>
      </>
    ),
  },
];
