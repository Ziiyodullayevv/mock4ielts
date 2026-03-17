import type { ReferenceVideoSlide, ListeningReadingSectionContent } from '../types';

import { Mic, PenTool, BookOpen, Headphones } from 'lucide-react';

const listeningReadingSlides: ReferenceVideoSlide[] = [
  {
    id: 'reference-slide-1',
    poster: '/assets/home/carusel/posters/listening-1.png',
    previewVideo: '/assets/home/carusel/videos/listening-1.mp4',
    previewVideoAlt: 'IELTS listening practice carousel preview',
    references: [
      {
        alt: 'Listening poster',
        id: 'reference-slide-1-char-1',
        image: '/assets/home/carusel/posters/listening-1.png',
      },
      {
        alt: 'Reading poster',
        id: 'reference-slide-1-object',
        image: '/assets/home/carusel/posters/reading-1.png',
      },
      {
        alt: 'Writing poster',
        id: 'reference-slide-1-char-2',
        image: '/assets/home/carusel/posters/writing-1.png',
      },
    ],
  },
  {
    id: 'reference-slide-2',
    poster: '/assets/home/carusel/posters/reading-1.png',
    previewVideo: '/assets/home/carusel/videos/reading-1.mp4',
    previewVideoAlt: 'IELTS reading practice carousel preview',
    references: [
      {
        alt: 'Reading poster',
        id: 'reference-slide-2-desert',
        image: '/assets/home/carusel/posters/reading-1.png',
      },
      {
        alt: 'Speaking poster',
        id: 'reference-slide-2-robot',
        image: '/assets/home/carusel/posters/speaking-1.png',
      },
      {
        alt: 'Listening poster',
        id: 'reference-slide-2-light',
        image: '/assets/home/carusel/posters/listening-1.png',
      },
    ],
  },
];

const writingSpeakingSlides: ReferenceVideoSlide[] = [
  {
    id: 'reference-slide-3',
    poster: '/assets/home/carusel/posters/writing-1.png',
    previewVideo: '/assets/home/carusel/videos/writing-1.mp4',
    previewVideoAlt: 'IELTS writing practice carousel preview',
    references: [
      {
        alt: 'Writing poster',
        id: 'reference-slide-3-city',
        image: '/assets/home/carusel/posters/writing-1.png',
      },
      {
        alt: 'Listening poster',
        id: 'reference-slide-3-character',
        image: '/assets/home/carusel/posters/listening-1.png',
      },
      {
        alt: 'Speaking poster',
        id: 'reference-slide-3-mood',
        image: '/assets/home/carusel/posters/speaking-1.png',
      },
    ],
  },
  {
    id: 'reference-slide-4',
    poster: '/assets/home/carusel/posters/speaking-1.png',
    previewVideo: '/assets/home/carusel/videos/speaking-1.mp4',
    previewVideoAlt: 'IELTS speaking practice carousel preview',
    references: [
      {
        alt: 'Speaking poster',
        id: 'reference-slide-4-speaking',
        image: '/assets/home/carusel/posters/speaking-1.png',
      },
      {
        alt: 'Reading poster',
        id: 'reference-slide-4-reading',
        image: '/assets/home/carusel/posters/reading-1.png',
      },
      {
        alt: 'Writing poster',
        id: 'reference-slide-4-writing',
        image: '/assets/home/carusel/posters/writing-1.png',
      },
    ],
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
      icon: <Headphones className="size-9" strokeWidth={1.75} />,
      imageSrc: 'https://image01.cf.vidu.studio/vidu/media-asset/viduAbilityReEnd-254ebd10.webp',
      imageAlt: 'Listening practice card background',
    },
    {
      title: 'Reading',
      highlight: 'Practice',
      description:
        'Solve IELTS reading passages with different question formats and improve your speed and comprehension.',
      cta: 'Start Reading',
      icon: <BookOpen className="size-9" strokeWidth={1.75} />,
      imageSrc: 'https://image01.cf.vidu.studio/vidu/media-asset/viduAbilityReStart-01e52c27.webp',
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
      icon: <PenTool className="size-9" strokeWidth={1.75} />,
      imageSrc: 'https://image01.cf.vidu.studio/vidu/media-asset/viduAbilityStart-0779cc5f.webp',
      imageAlt: 'Writing tasks card background',
    },
    {
      title: 'Speaking',
      highlight: 'Practice',
      description:
        'Prepare for IELTS speaking interviews with cue cards and common exam questions.',
      cta: 'Start Speaking',
      icon: <Mic className="size-9" strokeWidth={1.75} />,
      imageSrc: 'https://image01.cf.vidu.studio/vidu/media-asset/viduAbilityEnd-0a6abe66.webp',
      imageAlt: 'Speaking practice card background',
    },
  ],
};

export const heroShowCaseSections: ListeningReadingSectionContent[] = [
  listeningReadingSection,
  writingSpeakingSection,
];
