'use client';

import type { ContestItem } from '../types';

import Link from 'next/link';
import { cn } from '@/src/lib/utils';
import { useMemo, useState } from 'react';
import { paths } from '@/src/routes/paths';
import { toast } from '@/src/components/ui/sonner';
import { buildLoginHref } from '@/src/auth/utils/return-to';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import { useRouter, usePathname, useSearchParams } from '@/src/routes/hooks';
import {
  Star,
  Swords,
  Handshake,
  AlarmClock,
  ChevronLeft,
  ExternalLink,
} from 'lucide-react';

import { useCountdown } from '../hooks';
import {
  contestButtonClassName,
  contestIconButtonClassName,
} from '../components/contest-theme';
import {
  useContestQuery,
  useStartContestMutation,
  useRegisterContestMutation,
} from '../hooks/use-contest-queries';
import {
  formatCountdown,
  formatStartLabel,
  openContestGoogleCalendar,
  formatContestDisplayTitle,
} from '../utils';

type ContestDetailViewProps = {
  contestId: string;
};

type ContestTone = 'default' | 'violet';

const getContestPalette = (tone: ContestTone) =>
  tone === 'violet'
    ? {
        accentText: 'text-[#6d5bd8] dark:text-[#b7a8ff]',
        bullet: 'text-[#6d5bd8] dark:text-[#b7a8ff]',
        star: 'fill-[#8b7cf6] text-[#8b7cf6]',
        title: 'text-[#5f49cf] dark:text-[#a997ff]',
      }
    : {
        accentText: 'text-[#b76c00] dark:text-[#ffb347]',
        bullet: 'text-[#d98200] dark:text-[#ffb347]',
        star: 'fill-[#ffcf33] text-[#ffcf33]',
        title: 'text-[#d97706] dark:text-[#ff7a1a]',
      };

const DEFAULT_CONTEST_ENTRY_TOKEN_PRICE = 12;

const getContestDetailPageClassName = (tone: ContestTone) =>
  tone === 'violet'
    ? 'min-h-screen overflow-hidden bg-[radial-gradient(ellipse_104%_64%_at_top_center,rgba(147,127,225,0.22)_0%,rgba(147,127,225,0.10)_44%,transparent_92%),linear-gradient(180deg,#f3efff_0%,#fbf9ff_54%,#ffffff_100%)] pt-30 pb-14 text-stone-950 dark:bg-[radial-gradient(ellipse_104%_64%_at_top_center,rgba(147,127,225,0.20)_0%,rgba(147,127,225,0.09)_46%,transparent_92%),linear-gradient(180deg,#100b1f_0%,#090711_58%,#050505_100%)] dark:text-white'
    : 'min-h-screen overflow-hidden bg-[radial-gradient(ellipse_104%_64%_at_top_center,rgba(255,179,71,0.20)_0%,rgba(255,179,71,0.10)_42%,transparent_90%),linear-gradient(180deg,#fff8e4_0%,#fffdf7_54%,#ffffff_100%)] pt-30 pb-14 text-stone-950 dark:bg-[radial-gradient(ellipse_104%_64%_at_top_center,rgba(255,159,47,0.16)_0%,rgba(255,159,47,0.08)_44%,transparent_92%),linear-gradient(180deg,#0b0b09_0%,#070707_58%,#050505_100%)] dark:text-white';

const contestDetailPanelClassName =
  'rounded-3xl border border-[#f0d79a] bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-white/6 dark:shadow-none';

const contestDetailMutedTextClassName = 'text-stone-600 dark:text-white/64';

const getContestDetailActionButtonClassName = (tone: ContestTone) =>
  tone === 'violet'
    ? 'inline-flex items-center justify-center rounded-full border border-black/5 bg-white/70 text-[#6d5bd8] shadow-[0_10px_28px_rgba(15,23,42,0.10)] transition-[background-color,color,transform] duration-200 hover:bg-white/85 hover:text-[#513fc1] active:scale-[0.98] dark:border-white/8 dark:bg-white/8 dark:text-[#b7a8ff] dark:shadow-none dark:hover:bg-white/12 dark:hover:text-[#c9c0ff]'
    : 'inline-flex items-center justify-center rounded-full border border-black/5 bg-white/70 text-[#d97706] shadow-[0_10px_28px_rgba(15,23,42,0.10)] transition-[background-color,color,transform] duration-200 hover:bg-white/85 hover:text-[#b85c00] active:scale-[0.98] dark:border-white/8 dark:bg-white/8 dark:text-[#ff9f2f] dark:shadow-none dark:hover:bg-white/12 dark:hover:text-[#ffb347]';

function getContestTone(contest: ContestItem | undefined, requestedTone: ContestTone): ContestTone {
  if (requestedTone === 'violet') {
    return 'violet';
  }

  const gradient = contest?.gradient.toLowerCase() ?? '';

  return gradient.includes('937fe1') ||
    gradient.includes('251b80') ||
    gradient.includes('8b5cf6') ||
    gradient.includes('312e81')
    ? 'violet'
    : 'default';
}

const getContestStatus = (startsAt: Date, endsAt: Date, apiStatus?: ContestItem['contestStatus']) => {
  if (apiStatus === 'finished' || apiStatus === 'grading') {
    return 'completed';
  }

  if (apiStatus === 'live') {
    return 'live';
  }

  if (apiStatus === 'scheduled') {
    return 'upcoming';
  }

  const now = new Date();

  if (now < startsAt) {
    return 'upcoming';
  }

  if (now < endsAt) {
    return 'live';
  }

  return 'completed';
};

export function ContestDetailView({ contestId }: ContestDetailViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isHydrated } = useAuthSession();
  const contestQuery = useContestQuery(contestId);
  const registerMutation = useRegisterContestMutation(contestId);
  const startMutation = useStartContestMutation(contestId);
  const contest = contestQuery.data;
  const [registeredOverride, setRegisteredOverride] = useState<boolean | null>(null);
  const startsAt = useMemo(() => new Date(contest?.startsAt ?? new Date().toISOString()), [contest?.startsAt]);
  const endsAt = useMemo(() => new Date(contest?.endsAt ?? new Date().toISOString()), [contest?.endsAt]);
  const countdown = useCountdown(startsAt);
  const requestedTone: ContestTone = searchParams.get('tone') === 'violet' ? 'violet' : 'default';
  const loadingPageClassName = getContestDetailPageClassName(requestedTone);

  if (contestQuery.isLoading) {
    return <ContestDetailSkeleton tone={requestedTone} />;
  }

  if (contestQuery.isError || !contest) {
    return (
      <main className={cn(loadingPageClassName, 'px-4 sm:px-6')}>
        <div className={cn('mx-auto max-w-[760px]', contestDetailPanelClassName)}>
          <h1 className="text-[28px] font-semibold tracking-normal sm:text-[34px]">Contest not found</h1>
          <p className={cn('mt-3 text-sm leading-6', contestDetailMutedTextClassName)}>
            This contest could not be loaded right now.
          </p>
          <Link
            href={paths.contest.root}
            className={cn(contestButtonClassName, 'mt-6 h-11 gap-2 px-4')}
          >
            <ChevronLeft className="size-4" />
            <span>Back</span>
          </Link>
        </div>
      </main>
    );
  }

  const tone = getContestTone(contest, requestedTone);
  const palette = getContestPalette(tone);
  const pageClassName = getContestDetailPageClassName(tone);
  const actionButtonClassName = getContestDetailActionButtonClassName(tone);
  const displayTitle = formatContestDisplayTitle(contest.title, tone);
  const status = getContestStatus(startsAt, endsAt, contest.contestStatus);
  const isRegistered = registeredOverride ?? Boolean(contest.isRegistered);
  const canRegister = status === 'upcoming' && !isRegistered;
  const canStart = status === 'live' && isRegistered;
  const entryTokenCost = contest.totalTokenCount || DEFAULT_CONTEST_ENTRY_TOKEN_PRICE;

  const statusLabel =
    status === 'completed'
      ? 'Completed'
      : status === 'live'
        ? 'Live now'
        : `Starts in ${formatCountdown(countdown)}`;
  const registerButtonLabel =
    status === 'completed'
      ? 'Ended'
      : canStart
        ? 'Start Contest'
        : isRegistered
          ? 'Registered'
          : 'Register';
  const PrimaryActionIcon = canStart || status === 'completed' ? Swords : Handshake;

  const handlePrimaryAction = async () => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.push(buildLoginHref(pathname || paths.contest.details(contestId)));
      return;
    }

    if (canStart) {
      try {
        await startMutation.mutateAsync();
        toast.success('Contest started.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to start contest right now.');
      }
      return;
    }

    if (!canRegister) {
      toast.error(status === 'completed' ? 'This contest has already ended.' : 'You are already registered.');
      return;
    }

    try {
      await registerMutation.mutateAsync();
      setRegisteredOverride(true);
      toast.success('Registered for contest.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to register right now.');
    }
  };

  const handleReminder = () => {
    openContestGoogleCalendar({
      description: contest.description,
      endsAt: contest.endsAt,
      slug: tone === 'violet' ? `${contest.slug}?tone=violet` : contest.slug,
      startsAt: contest.startsAt,
      title: displayTitle,
    });
  };

  return (
    <main className={cn(pageClassName, 'px-4 sm:px-6')}>
      <div className="mx-auto w-full max-w-300">
        <div>
          <Link
            href={paths.contest.root}
            className={cn(
              contestIconButtonClassName,
              'size-10 rounded-xl bg-white/70 text-stone-700 dark:bg-white/8 dark:text-white/70'
            )}
            aria-label="Back to contests"
          >
            <ChevronLeft className="size-5" strokeWidth={2.2} />
          </Link>
        </div>

        <section className="mt-12">
          <h1
            className={cn(
              'text-[34px] font-semibold leading-none tracking-normal sm:text-[42px] lg:text-[52px]',
              palette.title
            )}
          >
            {displayTitle}
          </h1>

          <div
            className={cn(
              'mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold sm:text-base',
              contestDetailMutedTextClassName
            )}
          >
            <span>{formatStartLabel(startsAt)}</span>
            <span className="hidden h-5 w-px bg-stone-300 sm:block dark:bg-white/12" aria-hidden />
            <span className="flex items-center gap-3">
              <span className="size-2.5 rounded-full bg-stone-300 dark:bg-white/14" aria-hidden />
              <span className="tabular-nums">{statusLabel}</span>
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={registerMutation.isPending || startMutation.isPending || status === 'completed'}
              className={cn(
                actionButtonClassName,
                'h-10 gap-2 px-5 text-sm font-semibold',
                status === 'completed' && 'cursor-not-allowed opacity-70'
              )}
            >
              <PrimaryActionIcon className="size-4" />
              <span>
                {registerMutation.isPending || startMutation.isPending
                  ? 'Please wait'
                  : registerButtonLabel}
              </span>
            </button>

            <button
              type="button"
              onClick={handleReminder}
              className={cn(
                contestIconButtonClassName,
                'size-10 bg-white/70 text-stone-700 dark:bg-white/8 dark:text-white/86'
              )}
              aria-label="Set reminder"
            >
              <AlarmClock className="size-4" />
            </button>

            <Link
              href={contest.slug}
              className={cn(
                contestIconButtonClassName,
                'size-10 bg-white/70 text-stone-700 dark:bg-white/8 dark:text-white/86'
              )}
              aria-label="Open contest link"
            >
              <ExternalLink className="size-4" />
            </Link>
          </div>
        </section>

        <section className="mt-12 space-y-6">
          <div className="space-y-4">
            <h2 className="text-[22px] font-semibold leading-tight tracking-normal sm:text-[26px]">
              IELTS contest practice on Mock4IELTS
            </h2>
            <p
              className={cn(
                'max-w-[720px] text-sm leading-6',
                contestDetailMutedTextClassName
              )}
            >
              {contest.description ??
                'Join a timed IELTS-style challenge, complete the available skills, and compare your result on the Mock4IELTS leaderboard.'}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-3 text-[22px] font-semibold tracking-normal sm:text-[26px]">
              <Star className={cn('size-5', palette.star)} />
              <span>Entry and rewards</span>
            </h3>

            <ul
              className={cn(
                'max-w-[760px] space-y-4 text-sm leading-6',
                contestDetailMutedTextClassName
              )}
            >
              <li className="flex gap-4">
                <span className={cn('mt-3 size-2 shrink-0 rounded-full bg-current', palette.bullet)} />
                <span>
                  Entry is <strong>{entryTokenCost} tokens</strong> for one complete contest session.
                </span>
              </li>
              <li className="flex gap-4">
                <span className={cn('mt-3 size-2 shrink-0 rounded-full bg-current', palette.bullet)} />
                <span>
                  Top 3 finishers receive sustainable bonus tokens: <strong>15</strong>, <strong>10</strong>,
                  and <strong>5</strong> tokens.
                </span>
              </li>
              <li className="flex gap-4">
                <span className={cn('mt-3 size-2 shrink-0 rounded-full bg-current', palette.bullet)} />
                <span>
                  Ranks <strong>4th - 10th</strong> receive <strong>1 bonus token</strong> and all
                  participants keep their leaderboard result.
                </span>
              </li>
            </ul>
          </div>
        </section>

        <p
          className={cn(
            'mt-8 max-w-[760px] text-sm leading-6',
            contestDetailMutedTextClassName
          )}
        >
          Register before the start time. Results are calculated after the contest window closes and
          can be used to plan your next Mock4IELTS practice session.
        </p>
      </div>
    </main>
  );
}

function ContestDetailSkeleton({ tone }: { tone: ContestTone }) {
  return (
    <main className={cn(getContestDetailPageClassName(tone), 'px-4 sm:px-6')}>
      <div className="mx-auto w-full max-w-300">
        <div className="size-10 animate-pulse rounded-xl bg-black/10 dark:bg-white/10" />
        <div className="mt-12">
          <div className="h-12 w-full max-w-[520px] animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
          <div className="mt-5 h-5 w-full max-w-[420px] animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
          <div className="mt-8 h-10 w-40 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
        </div>
        <div className="mt-12 space-y-4">
          <div className="h-6 w-56 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
          <div className="h-5 w-full max-w-[720px] animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
          <div className="h-5 w-5/6 max-w-[640px] animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
        </div>
      </div>
    </main>
  );
}
