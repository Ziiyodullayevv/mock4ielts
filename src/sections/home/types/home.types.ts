import type { ReactNode } from 'react';

export type CommunityImageItem = {
  src: string;
  alt: string;
  className: string;
  width: number;
  height: number;
  depth: number;
};

export type HeroSlide = {
  id: number;
  poster: string;
  prompt: string;
  video: string;
};

export type ReferenceVideoItem = {
  alt: string;
  id: string;
  image: string;
};

export type ReferenceVideoSlide = {
  id: string;
  poster: string;
  previewVideo: string;
  previewVideoAlt: string;
  references: [ReferenceVideoItem, ReferenceVideoItem, ReferenceVideoItem];
};

export type ReferenceVideoSectionContent = {
  slides: ReferenceVideoSlide[];
};

export type FAQItem = {
  question: string;
  answer: ReactNode;
};

export type BenefitItem = {
  title: string;
  highlight: string;
  description: string;
  icon: ReactNode;
};

export type ListeningReadingCardItem = {
  title: string;
  highlight: string;
  description: string;
  cta: string;
  href?: string;
  icon: ReactNode;
  imageSrc: string;
  imageAlt: string;
};

export type ListeningReadingSectionContent = {
  title: string;
  description: string;
  cards: ListeningReadingCardItem[];
};

export type GalleryImage = {
  src: string;
  alt: string;
};
