'use client';

import type { ContestItem } from '../types';

import Link from 'next/link';
import { cn } from '@/src/lib/utils';
import { useMemo, useState } from 'react';
import { paths } from '@/src/routes/paths';
import { toast } from '@/src/components/ui/sonner';
import {
  Star,
  Trophy,
  Swords,
  ListTree,
  BellRing,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

import { useCountdown } from '../hooks';
import { formatCountdown, formatStartLabel } from '../utils';
import {
  contestButtonClassName,
  contestIconButtonClassName,
  contestPrimaryButtonClassName,
} from '../components/contest-theme';

type ContestDetailViewProps = {
  contest: ContestItem;
};

const getContestPalette = (contest: ContestItem) => {
  const isPurple = contest.id.includes('biweekly') || contest.gradient.includes('#937FE1');

  if (isPurple) {
    return {
      accent: '#a78bfa',
      accentText: 'text-[#a78bfa]',
      bullet: 'text-[#8b5cf6]',
      glow: 'from-[#251b80]/85 via-[#1c164e]/90 to-[#0f0d17]',
      title: 'text-[#a78bfa]',
    };
  }

  return {
    accent: '#ff8a1f',
    accentText: 'text-[#ff9f2f]',
    bullet: 'text-[#2f9bff]',
    glow: 'from-[#2a1e10] via-[#18150e] to-[#121210]',
    title: 'text-[#ff7a1a]',
  };
};

const getContestStatus = (startsAt: Date, endsAt: Date) => {
  const now = new Date();

  if (now < startsAt) {
    return 'upcoming';
  }

  if (now < endsAt) {
    return 'live';
  }

  return 'completed';
};

export function ContestDetailView({ contest }: ContestDetailViewProps) {
  const startsAt = useMemo(() => new Date(contest.startsAt), [contest.startsAt]);
  const endsAt = useMemo(() => new Date(contest.endsAt), [contest.endsAt]);
  const countdown = useCountdown(startsAt);
  const [isRegistered, setIsRegistered] = useState(false);
  const palette = getContestPalette(contest);
  const status = getContestStatus(startsAt, endsAt);
  const canRegister = status !== 'completed';

  const statusLabel =
    status === 'completed'
      ? 'Completed'
      : status === 'live'
        ? 'Live now'
        : `Starts in ${formatCountdown(countdown)}`;
  const registerButtonLabel = !canRegister ? 'Ended' : isRegistered ? 'Registered' : 'Register';

  const handleRegister = () => {
    if (!canRegister) {
      toast.error('This contest has already ended.');
      return;
    }

    setIsRegistered((current) => {
      const next = !current;
      toast.success(next ? 'Registered for contest.' : 'Registration removed.');
      return next;
    });
  };

  const handleReminder = () => {
    toast.success('Reminder set.');
  };

  return (
    <main
      className={cn(
        'min-h-screen overflow-hidden bg-[#121210] pt-24 pb-14 text-white',
        `bg-linear-to-br ${palette.glow}`
      )}
    >
      <div className="mx-auto w-full max-w-[760px] px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={paths.contest.root}
            className={cn(contestButtonClassName, 'h-11 gap-2 bg-white/4 px-4 text-white/86 dark:text-white/86')}
          >
            <ArrowLeft className="size-4" />
            <span>Back</span>
          </Link>

          <div className={cn(contestIconButtonClassName, 'size-12 bg-white/4 text-white/86 dark:text-white/86')}>
            <Trophy className="size-6" />
          </div>
        </div>

        <section className="mt-8">
          <h1 className={cn('text-[44px] font-semibold leading-none tracking-normal sm:text-[56px]', palette.title)}>
            {contest.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-[18px] font-medium text-white/62 sm:text-[22px]">
            <span>{formatStartLabel(startsAt)}</span>
            <span className="h-5 w-px bg-white/12" aria-hidden />
          </div>

          <div className="mt-3 flex items-center gap-3 text-[18px] font-medium text-white/62 sm:text-[22px]">
            <span className="size-3 rounded-full bg-white/12" aria-hidden />
            <span className="tabular-nums">{statusLabel}</span>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleRegister}
              className={cn(
                contestPrimaryButtonClassName,
                'h-15 gap-3 px-8 text-[22px] font-semibold',
                !canRegister && 'cursor-not-allowed opacity-70'
              )}
            >
              <Swords className="size-7" />
              <span>{registerButtonLabel}</span>
            </button>

            <button
              type="button"
              onClick={handleReminder}
              className={cn(contestIconButtonClassName, 'size-15 bg-white/6 text-white/90 dark:text-white/90')}
              aria-label="Set reminder"
            >
              <BellRing className="size-7" />
            </button>

            <Link
              href={contest.slug}
              className={cn(contestIconButtonClassName, 'size-15 bg-white/6 text-white/90 dark:text-white/90')}
              aria-label="Open contest link"
            >
              <ExternalLink className="size-7" />
            </Link>
          </div>
        </section>

        <section className="mt-16 space-y-7 text-white">
          <ListTree className="size-8 text-white/62" />

          <div className="space-y-5">
            <h2 className="text-[30px] font-semibold leading-tight tracking-normal sm:text-[36px]">
              Welcome to the Mock4IELTS {contest.title}
            </h2>
            <p className="text-[21px] leading-relaxed text-white/82 sm:text-[28px]">
              {contest.description ??
                'Compete in a timed IELTS-style contest and compare your result on the leaderboard.'}
            </p>
          </div>

          <div className="space-y-5">
            <h3 className="flex items-center gap-3 text-[30px] font-semibold tracking-normal sm:text-[36px]">
              <Star className="size-8 fill-yellow-300 text-yellow-300" />
              <span>Bonus Prizes</span>
            </h3>

            <ul className="space-y-6 text-[21px] leading-relaxed text-white/86 sm:text-[28px]">
              <li className="flex gap-5">
                <span className={cn('mt-3 size-2 shrink-0 rounded-full bg-current', palette.bullet)} />
                <span>
                  Contestants ranked <strong>1st - 3rd</strong> receive premium token rewards.
                </span>
              </li>
              <li className="flex gap-5">
                <span className={cn('mt-3 size-2 shrink-0 rounded-full bg-current', palette.bullet)} />
                <span>
                  Contestants ranked <strong>4th - 10th</strong> unlock extra IELTS practice attempts.
                </span>
              </li>
              <li className="flex gap-5">
                <span className={cn('mt-3 size-2 shrink-0 rounded-full bg-current', palette.bullet)} />
                <span>
                  Special ranks <strong>50th, 100th, 500th, and 1000th</strong> receive bonus rewards.
                </span>
              </li>
            </ul>
          </div>

          <p className="text-[20px] leading-relaxed text-white/82 sm:text-[26px]">
            Registered users can join before the contest starts. Results are ranked after the contest
            window closes.
          </p>
        </section>
      </div>
    </main>
  );
}
