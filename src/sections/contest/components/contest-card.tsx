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
  const mobileAspectRatio = '400 / 250';

  const width = contest.width ?? 400;
  const height = contest.height ?? 250;

  return (
    <div
      aria-label={contest.title}
      className="w-[min(34rem,calc(100vw-3.5rem))] shrink-0 snap-start self-center lg:w-auto lg:snap-none"
      style={
        {
          '--contest-card-height': `${height}px`,
          '--contest-card-width': `${width}px`,
        } as React.CSSProperties
      }
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-none dark:bg-[#171717] dark:shadow-none lg:hidden">
        <Link href={contest.slug} aria-label={contest.title} className="absolute inset-0 z-10" />

        <div
          className="relative overflow-hidden"
          style={{
            aspectRatio: mobileAspectRatio,
            backgroundImage: contest.gradient,
          }}
        >
          <div
            aria-hidden
            className="absolute inset-y-[-10%] left-[-30%] w-[82%] rounded-full border border-white/28 bg-white/10"
          />
          <div
            aria-hidden
            className="absolute -right-[24%] top-[-14%] h-[120%] w-[82%] rounded-full border border-white/20 bg-white/8"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/82 via-black/36 to-transparent"
          />
          <img
            src={contest.imageUrl}
            alt={contest.title}
            className="h-full w-full object-cover object-center"
          />
          <ContestCountdownChip startsAt={startsAt} endsAt={endsAt} variant="mobile" />
          <ContestCardFooter
            title={contest.title}
            startLabel={startLabel}
            showReminder={isUpcoming}
          />
        </div>
      </div>

      <div
        className="hidden lg:block"
        style={{
          width: `min(${width}px, 85vw)`,
          height: 'var(--contest-card-height)',
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
    </div>
  );
}
