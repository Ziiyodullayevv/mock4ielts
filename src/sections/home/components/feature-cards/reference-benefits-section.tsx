import type { ListeningReadingCardItem } from '../../types';

import { FeatureCard } from './feature-card';

type FeatureCardsSectionProps = {
  cards: ListeningReadingCardItem[];
};

export function FeatureCardsSection({ cards }: FeatureCardsSectionProps) {
  return (
    <section className="mt-2 flex w-full flex-col items-stretch justify-center gap-4 md:mt-5 md:flex-row md:items-center md:gap-5">
      {cards.map((item) => (
        <FeatureCard key={`${item.title}-${item.highlight}`} item={item} />
      ))}
    </section>
  );
}
