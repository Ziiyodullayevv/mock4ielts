import type { ListeningReadingCardItem } from '../../types';

import { FeatureCard } from './feature-card';

type FeatureCardsSectionProps = {
  cards: ListeningReadingCardItem[];
};

export function FeatureCardsSection({ cards }: FeatureCardsSectionProps) {
  return (
    <section className="mt-5 hidden w-full items-center justify-center gap-5 md:flex">
      {cards.map((item) => (
        <FeatureCard key={`${item.title}-${item.highlight}`} item={item} />
      ))}
    </section>
  );
}
