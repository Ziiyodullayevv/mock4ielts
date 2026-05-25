'use client';

import type { ListeningReadingCardItem } from '../../types';

import { motion } from 'motion/react';

import { FeatureCard } from './feature-card';

type FeatureCardsSectionProps = {
  cards: ListeningReadingCardItem[];
};

const HIDDEN = { opacity: 0, y: 24, filter: 'blur(8px)' };
const VISIBLE = { opacity: 1, y: 0, filter: 'blur(0px)' };
const TRANSITION = { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const };

export function FeatureCardsSection({ cards }: FeatureCardsSectionProps) {
  return (
    <section className="mt-2 flex w-full flex-col items-stretch justify-center gap-4 md:mt-5 md:flex-row md:items-center md:gap-5">
      {cards.map((item, index) => (
        <motion.div
          key={`${item.title}-${item.highlight}`}
          initial={HIDDEN}
          whileInView={VISIBLE}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ ...TRANSITION, delay: 0.08 + index * 0.12 }}
        >
          <FeatureCard item={item} />
        </motion.div>
      ))}
    </section>
  );
}
