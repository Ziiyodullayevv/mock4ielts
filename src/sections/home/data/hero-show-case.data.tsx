import type { ReferenceVideoSectionContent, ListeningReadingSectionContent } from '../types';

import { Mic, PenTool, BookOpen, Headphones } from 'lucide-react';

export const referenceVideoSectionContent: ReferenceVideoSectionContent = {
  slides: [
    {
      id: 'reference-slide-1',
      poster: '/assets/hero/posters/hero-2.webp',
      previewVideo: '/assets/hero/videos/hero-2.mp4',
      previewVideoAlt: 'Anime style reference composition in a cafe',
      references: [
        {
          alt: 'Character reference one',
          id: 'reference-slide-1-char-1',
          image: '/assets/hero/posters/hero-2.webp',
        },
        {
          alt: 'Object reference',
          id: 'reference-slide-1-object',
          image: '/assets/hero/posters/hero-1.webp',
        },
        {
          alt: 'Character reference two',
          id: 'reference-slide-1-char-2',
          image: '/assets/hero/posters/hero-3.webp',
        },
      ],
    },
    {
      id: 'reference-slide-2',
      poster: '/assets/hero/posters/hero-1.webp',
      previewVideo: '/assets/hero/videos/hero-1.mp4',
      previewVideoAlt: 'Desert scene generated from character and style references',
      references: [
        {
          alt: 'Desert reference',
          id: 'reference-slide-2-desert',
          image: '/assets/hero/posters/hero-1.webp',
        },
        {
          alt: 'Robotics reference',
          id: 'reference-slide-2-robot',
          image: '/assets/hero/posters/hero-4.webp',
        },
        {
          alt: 'Lighting reference',
          id: 'reference-slide-2-light',
          image: '/assets/hero/posters/hero-5.webp',
        },
      ],
    },
    {
      id: 'reference-slide-3',
      poster: '/assets/hero/posters/hero-3.webp',
      previewVideo: '/assets/hero/videos/hero-3.mp4',
      previewVideoAlt: 'Mechanical city visual assembled with references',
      references: [
        {
          alt: 'City reference',
          id: 'reference-slide-3-city',
          image: '/assets/hero/posters/hero-3.webp',
        },
        {
          alt: 'Character style reference',
          id: 'reference-slide-3-character',
          image: '/assets/hero/posters/hero-2.webp',
        },
        {
          alt: 'Mood reference',
          id: 'reference-slide-3-mood',
          image: '/assets/hero/posters/hero-6.png',
        },
      ],
    },
  ],
};

export const listeningReadingSection: ListeningReadingSectionContent = {
  title: 'Listening & Reading',
  description:
    'Strengthen your IELTS listening and reading skills with real exam-style questions and timed practice.',
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
