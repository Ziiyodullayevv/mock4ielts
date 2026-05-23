import type { ReferenceVideoSlide, ListeningReadingSectionContent } from '../types';

import { paths } from '@/src/routes/paths';
import { Mic, PenTool, BookOpen, Headphones } from 'lucide-react';

const listeningReadingSlides: ReferenceVideoSlide[] = [
  {
    id: 'reference-slide-1',
    poster: '/assets/home/carusel/banner-1.jpg',
    previewVideoAlt: 'IELTS listening practice carousel preview',
  },
  {
    id: 'reference-slide-2',
    poster: '/assets/home/carusel/banner-2.jpg',
    previewVideoAlt: 'IELTS reading practice carousel preview',
  },
];

const writingSpeakingSlides: ReferenceVideoSlide[] = [
  {
    id: 'reference-slide-3',
    poster: '/assets/home/carusel/banner-3.avif',
    previewVideoAlt: 'IELTS writing practice carousel preview',
  },
  {
    id: 'reference-slide-4',
    poster: '/assets/home/carusel/banner-4.jpg',
    previewVideoAlt: 'IELTS speaking practice carousel preview',
  },
];

export const listeningReadingSection: ListeningReadingSectionContent = {
  title: 'Listening & Reading',
  description:
    'Strengthen your IELTS listening and reading skills with real exam-style questions and timed practice.',
  slides: listeningReadingSlides,
  cards: [
    {
      title: 'Listening',
      highlight: 'Practice',
      description:
        'Practice with real IELTS listening tasks including conversations, lectures, and multiple question types.',
      cta: 'Start Listening',
      href: paths.practice.listening.root,
      icon: <Headphones className="size-9" strokeWidth={1.75} />,
      imageSrc: '/assets/home/feature-cards/listening.webp',
      imageAlt: 'Listening practice card background',
    },
    {
      title: 'Reading',
      highlight: 'Practice',
      description:
        'Solve IELTS reading passages with different question formats and improve your speed and comprehension.',
      cta: 'Start Reading',
      href: paths.practice.reading.root,
      icon: <BookOpen className="size-9" strokeWidth={1.75} />,
      imageSrc: '/assets/home/feature-cards/reading.webp',
      imageAlt: 'Reading practice card background',
    },
  ],
};

export const writingSpeakingSection: ListeningReadingSectionContent = {
  title: 'Writing & Speaking',
  description:
    'Improve your writing and speaking skills with realistic IELTS tasks and exam-style practice.',
  slides: writingSpeakingSlides,
  cards: [
    {
      title: 'Writing',
      highlight: 'Tasks',
      description:
        'Practice IELTS Writing Task 1 and Task 2 with real prompts and structured answers.',
      cta: 'Start Writing',
      href: paths.practice.writing.root,
      icon: <PenTool className="size-9" strokeWidth={1.75} />,
      imageSrc: '/assets/home/feature-cards/writing.webp',
      imageAlt: 'Writing tasks card background',
    },
    {
      title: 'Speaking',
      highlight: 'Practice',
      description:
        'Prepare for IELTS speaking interviews with cue cards and common exam questions.',
      cta: 'Start Speaking',
      href: paths.practice.speaking.root,
      icon: <Mic className="size-9" strokeWidth={1.75} />,
      imageSrc: '/assets/home/feature-cards/speaking.webp',
      imageAlt: 'Speaking practice card background',
    },
  ],
};

export const heroShowCaseSections: ListeningReadingSectionContent[] = [
  listeningReadingSection,
  writingSpeakingSection,
];
