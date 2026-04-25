'use client';

import type { ContestItem } from '../types';

import Link from 'next/link';
import TiltedCard from '@/src/components/TiltedCard';

import { formatStartLabel } from '../utils';
import { ContestCardFooter } from './contest-card-footer';
import { ContestCountdownChip } from './contest-countdown-chip';

type ContestCardProps = {
  contest: ContestItem;
};

export function ContestCard({ contest }: ContestCardProps) {
  const startsAt = new Date(contest.startsAt);
  const endsAt = new Date(contest.endsAt);
  const startLabel = formatStartLabel(startsAt);
  const isUpcoming = new Date() < startsAt;

  const width = contest.width ?? 400;
  const height = contest.height ?? 250;

  return (
    <div
      aria-label={contest.title}
      className="shrink-0 snap-center lg:snap-none"
      style={{
        width: `min(${width}px, 85vw)`,
        height,
      }}
    >
      <TiltedCard
        imageSrc={contest.imageUrl}
        altText={contest.title}
        containerWidth="100%"
        containerHeight="100%"
        imageWidth="100%"
        imageHeight="100%"
        rotateAmplitude={8}
        scaleOnHover={1.03}
        showMobileWarning={false}
        showTooltip={false}
        displayOverlayContent
        overlayContent={
          <div className="relative size-full overflow-hidden">
            <Link
              href={contest.slug}
              aria-label={contest.title}
              className="absolute inset-0 z-10"
            />
            <ContestCountdownChip startsAt={startsAt} endsAt={endsAt} />
            <ContestCardFooter
              title={contest.title}
              startLabel={startLabel}
              showReminder={isUpcoming}
            />
          </div>
        }
      />
    </div>
  );
}
