'use client';

import type { MouseEvent } from 'react';
import type { ContestItem } from '../types';

import Link from 'next/link';
import TiltedCard from '@/src/components/TiltedCard';

import { ContestCardFooter } from './contest-card-footer';
import { ContestCountdownChip } from './contest-countdown-chip';
import {
  formatStartLabel,
  openContestGoogleCalendar,
  formatContestDisplayTitle,
} from '../utils';

type ContestCardProps = {
  contest: ContestItem;
  tone?: 'default' | 'violet';
};

const DEFAULT_ORANGE_CONTEST_IMAGE = 'https://assets.leetcode.com/contest-config/contest/wc_card_img.png';
const VIOLET_CONTEST_IMAGE = 'https://assets.leetcode.com/contest-config/contest/bc_card_img.png';

function getContestCardImage(contest: ContestItem, tone: ContestCardProps['tone']) {
  if (tone !== 'violet') {
    return contest.imageUrl;
  }

  return contest.imageUrl === DEFAULT_ORANGE_CONTEST_IMAGE ? VIOLET_CONTEST_IMAGE : contest.imageUrl;
}

function VioletCardOverlay() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[linear-gradient(248deg,rgba(147,127,225,0.62)_0%,rgba(37,27,128,0.74)_100%)] mix-blend-color"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_68%_38%,rgba(255,255,255,0.22)_0%,transparent_34%)]"
      />
    </>
  );
}

export function ContestCard({ contest, tone = 'default' }: ContestCardProps) {
  const startsAt = new Date(contest.startsAt);
  const endsAt = new Date(contest.endsAt);
  const startLabel = formatStartLabel(startsAt);
  const isUpcoming = contest.contestStatus
    ? contest.contestStatus === 'scheduled' || contest.contestStatus === 'upcoming'
    : new Date() < startsAt;
  const mobileAspectRatio = '400 / 250';

  const width = contest.width ?? 400;
  const height = contest.height ?? 250;
  const imageSrc = getContestCardImage(contest, tone);
  const contestHref = tone === 'violet' ? `${contest.slug}?tone=violet` : contest.slug;
  const displayTitle = formatContestDisplayTitle(contest.title, tone);
  const handleReminderClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    openContestGoogleCalendar({
      description: contest.description,
      endsAt: contest.endsAt,
      slug: contestHref,
      startsAt: contest.startsAt,
      title: displayTitle,
    });
  };

  return (
    <div
      aria-label={displayTitle}
      className="w-[min(34rem,calc(100vw-3.5rem))] shrink-0 snap-start self-center lg:w-auto lg:snap-none"
      style={
        {
          '--contest-card-height': `${height}px`,
          '--contest-card-width': `${width}px`,
        } as React.CSSProperties
      }
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-none dark:bg-[#171717] dark:shadow-none lg:hidden">
        <Link href={contestHref} aria-label={displayTitle} className="absolute inset-0 z-10" />

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
            src={imageSrc}
            alt={displayTitle}
            className="h-full w-full object-cover object-center"
          />
          {tone === 'violet' ? <VioletCardOverlay /> : null}
          <ContestCountdownChip
            endsAt={endsAt}
            startsAt={startsAt}
            status={contest.contestStatus}
            variant="mobile"
          />
          <ContestCardFooter
            startsAt={startsAt}
            title={displayTitle}
            startLabel={startLabel}
            showReminder={isUpcoming}
            onReminderClick={handleReminderClick}
          />
        </div>
      </div>

      <div
        className="hidden rounded-[2rem] bg-transparent lg:block"
        style={{
          width: `min(${width}px, 85vw)`,
          height: 'var(--contest-card-height)',
        }}
      >
        <TiltedCard
          imageSrc={imageSrc}
          altText={displayTitle}
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
            <div className="relative size-full overflow-hidden rounded-[2rem]">
              {tone === 'violet' ? <VioletCardOverlay /> : null}
              <Link
                href={contestHref}
                aria-label={displayTitle}
                className="absolute inset-0 z-10"
              />
              <ContestCountdownChip
                endsAt={endsAt}
                startsAt={startsAt}
                status={contest.contestStatus}
              />
              <ContestCardFooter
                startsAt={startsAt}
                title={displayTitle}
                startLabel={startLabel}
                showReminder={isUpcoming}
                onReminderClick={handleReminderClick}
              />
            </div>
          }
        />
      </div>
    </div>
  );
}
