'use client';

import { cn } from '@/src/lib/utils';
import { formatIeltsBand } from '@/src/sections/practice/utils/ielts-band-score';
import {
  subscriptionCardClassName,
  subscriptionMutedTextClassName,
} from '@/src/sections/subscription/constants/subscription';
import {
  Mic,
  Files,
  Clock3,
  Trophy,
  PenTool,
  Activity,
  AudioLines,
  ChartColumn,
  BookOpenText,
} from 'lucide-react';
import {
  useMyStatisticsQuery,
  useMyExamStatisticsQuery,
  useMySectionStatisticsQuery,
  useMyStatisticsOverviewQuery,
} from '@/src/sections/statistics/hooks/use-statistics-queries';

const SECTION_META = {
  listening: {
    accentClassName: 'text-[#875dff]',
    Icon: AudioLines,
    label: 'Listening',
  },
  reading: {
    accentClassName: 'text-[#f0a634]',
    Icon: BookOpenText,
    label: 'Reading',
  },
  speaking: {
    accentClassName: 'text-[#39d0b5]',
    Icon: Mic,
    label: 'Speaking',
  },
  writing: {
    accentClassName: 'text-[#ff7a59]',
    Icon: PenTool,
    label: 'Writing',
  },
} as const;

const SECTION_ORDER = ['listening', 'reading', 'writing', 'speaking'] as const;

const formatBand = (value?: number | null) => formatIeltsBand(value);

const formatCount = (value?: number | null) =>
  new Intl.NumberFormat('en').format(Math.max(0, Math.round(value ?? 0)));

const formatDuration = (seconds?: number | null) => {
  const totalSeconds = Math.max(0, Math.round(seconds ?? 0));

  if (totalSeconds < 60) {
    return '0m';
  }

  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) {
    return `${minutes}m`;
  }

  if (!minutes) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
};

const formatLastPracticed = (value?: string | null) => {
  if (!value) {
    return 'Not yet';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not yet';
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
  }).format(parsedDate);
};

function StatisticsSkeleton() {
  return (
    <section className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={cn(subscriptionCardClassName, 'rounded-[22px] px-4 py-4')}
          >
            <div className="h-4 w-24 animate-pulse rounded-full bg-black/8 dark:bg-white/10" />
            <div className="mt-4 h-8 w-18 animate-pulse rounded-full bg-black/8 dark:bg-white/10" />
            <div className="mt-3 h-4 w-28 animate-pulse rounded-full bg-black/8 dark:bg-white/10" />
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className={cn(subscriptionCardClassName, 'rounded-[24px] px-5 py-5')}
          >
            <div className="h-5 w-28 animate-pulse rounded-full bg-black/8 dark:bg-white/10" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((__, itemIndex) => (
                <div
                  key={itemIndex}
                  className="rounded-[20px] bg-black/[0.03] px-4 py-4 dark:bg-white/[0.03]"
                >
                  <div className="h-4 w-20 animate-pulse rounded-full bg-black/8 dark:bg-white/10" />
                  <div className="mt-4 h-6 w-14 animate-pulse rounded-full bg-black/8 dark:bg-white/10" />
                  <div className="mt-3 h-4 w-20 animate-pulse rounded-full bg-black/8 dark:bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StatisticsOverview() {
  const overviewQuery = useMyStatisticsOverviewQuery(true);
  const shouldUseFallbackQueries = overviewQuery.isError;
  const myStatisticsQuery = useMyStatisticsQuery(true);
  const sectionStatisticsQuery = useMySectionStatisticsQuery(shouldUseFallbackQueries);
  const examStatisticsQuery = useMyExamStatisticsQuery(shouldUseFallbackQueries);
  const myStatistics = myStatisticsQuery.data ?? overviewQuery.data?.me;
  const examStatistics = overviewQuery.data?.exams ?? examStatisticsQuery.data;
  const sectionStatisticsItems = overviewQuery.data?.sections ?? sectionStatisticsQuery.data ?? [];

  const sectionStatistics = new Map(
    sectionStatisticsItems.map((entry) => [entry.section, entry])
  );
  const isInitialLoading =
    !overviewQuery.data &&
    !myStatisticsQuery.data &&
    (overviewQuery.isLoading ||
      myStatisticsQuery.isLoading ||
      (shouldUseFallbackQueries &&
        !sectionStatisticsQuery.data &&
        !examStatisticsQuery.data &&
        sectionStatisticsQuery.isLoading &&
        examStatisticsQuery.isLoading));
  const hasHardError =
    overviewQuery.error instanceof Error &&
    myStatisticsQuery.error instanceof Error &&
    sectionStatisticsQuery.error instanceof Error &&
    examStatisticsQuery.error instanceof Error;

  if (isInitialLoading) {
    return <StatisticsSkeleton />;
  }

  return (
    <section className="space-y-3">
      {hasHardError ? (
        <div
          className={cn(
            subscriptionCardClassName,
            'rounded-[22px] px-5 py-4 text-sm text-stone-700 dark:text-white/70'
          )}
        >
          We could not load your statistics right now.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            Icon: ChartColumn,
            label: 'Solved',
            muted: 'Completed practice sets',
            value: formatCount(myStatistics?.totalSolved),
          },
          {
            Icon: Activity,
            label: 'Overall Band',
            muted: 'Across available practice',
            value: formatBand(myStatistics?.overallAvg),
          },
          {
            Icon: Clock3,
            label: 'Active Time',
            muted: 'Focused practice time',
            value: formatDuration(myStatistics?.totalActiveTimeSeconds),
          },
          {
            Icon: Trophy,
            label: 'Highest Band',
            muted: 'Best mock or contest result',
            value: formatBand(examStatistics?.highestOverallBand),
          },
        ].map(({ Icon, label, muted, value }) => (
          <div key={label} className={cn(subscriptionCardClassName, 'rounded-[22px] px-4 py-4')}>
            <div className="flex items-center gap-2 text-stone-950 dark:text-white">
              <Icon className="size-4.5 text-[#ffb32b]" />
              <span className="text-sm font-semibold tracking-[-0.02em]">{label}</span>
            </div>
            <div className="mt-4 text-[26px] font-semibold tracking-[-0.05em] text-stone-950 dark:text-white">
              {value}
            </div>
            <p className={cn('mt-2 text-xs', subscriptionMutedTextClassName)}>{muted}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <div className={cn(subscriptionCardClassName, 'flex flex-col rounded-[24px] px-5 py-5')}>
            <div className="flex items-center gap-3 text-stone-950 dark:text-white">
              <ChartColumn className="size-5 text-[#f0a634]" />
              <h3 className="text-[18px] font-semibold tracking-[-0.035em]">Section Breakdown</h3>
            </div>

            <div className="mt-5 grid flex-1 auto-rows-fr gap-3 sm:grid-cols-2">
              {SECTION_ORDER.map((sectionKey) => {
                const stat = sectionStatistics.get(sectionKey);
                const meta = SECTION_META[sectionKey];
                const SectionIcon = meta.Icon;

                return (
                  <div
                    key={sectionKey}
                    className="flex h-full flex-col rounded-[20px] bg-black/[0.03] px-4 py-4 dark:bg-white/[0.03]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <SectionIcon className={cn('size-4.5', meta.accentClassName)} />
                        <span className="text-sm font-semibold text-stone-950 dark:text-white">
                          {meta.label}
                        </span>
                      </div>
                      <span className={cn('text-xs', subscriptionMutedTextClassName)}>
                        {formatLastPracticed(stat?.lastPracticedAt)}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-1 items-end justify-between gap-4">
                      <div>
                        <p
                          className={cn(
                            'text-xs uppercase tracking-[0.14em]',
                            subscriptionMutedTextClassName
                          )}
                        >
                          Solved
                        </p>
                        <p className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-stone-950 dark:text-white">
                          {formatCount(stat?.solvedCount)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p
                          className={cn(
                            'text-xs uppercase tracking-[0.14em]',
                            subscriptionMutedTextClassName
                          )}
                        >
                          Avg Band
                        </p>
                        <p className="mt-1 text-xl font-semibold tracking-[-0.04em] text-stone-950 dark:text-white">
                          {formatBand(stat?.averageBand)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className={cn(subscriptionCardClassName, 'rounded-[24px] px-5 py-5')}>
              <div className="flex items-center gap-3 text-stone-950 dark:text-white">
                <Files className="size-5 text-[#4fa8ff]" />
                <h3 className="text-[18px] font-semibold tracking-[-0.035em]">Exams & Contests</h3>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[20px] bg-black/[0.03] px-4 py-4 dark:bg-white/[0.03]">
                  <p
                    className={cn(
                      'text-xs uppercase tracking-[0.14em]',
                      subscriptionMutedTextClassName
                    )}
                  >
                    Mock Exams Taken
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-stone-950 dark:text-white">
                    {formatCount(examStatistics?.totalMocksTaken)}
                  </p>
                </div>

                <div className="rounded-[20px] bg-black/[0.03] px-4 py-4 dark:bg-white/[0.03]">
                  <p
                    className={cn(
                      'text-xs uppercase tracking-[0.14em]',
                      subscriptionMutedTextClassName
                    )}
                  >
                    Contests Joined
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-stone-950 dark:text-white">
                    {formatCount(examStatistics?.contestsParticipated)}
                  </p>
                </div>

                <div className="rounded-[20px] bg-black/[0.03] px-4 py-4 dark:bg-white/[0.03]">
                  <p
                    className={cn(
                      'text-xs uppercase tracking-[0.14em]',
                      subscriptionMutedTextClassName
                    )}
                  >
                    Avg Exam Band
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-stone-950 dark:text-white">
                    {formatBand(examStatistics?.averageOverallBand)}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
    </section>
  );
}
