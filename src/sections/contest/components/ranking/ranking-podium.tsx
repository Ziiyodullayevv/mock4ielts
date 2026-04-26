import type { Medal, RankingUser } from '../../types';

import Link from 'next/link';
import { cn } from '@/src/lib/utils';

import { contestInsetCardClassName } from '../contest-theme';

type RankingPodiumProps = {
  users: RankingUser[];
};

const MEDAL_RING: Record<
  Medal,
  { ring: string; inner: string; nameColor: string; ratingColor: string }
> = {
  gold: {
    ring: 'rgb(98, 69, 18)',
    inner: 'rgb(233, 205, 119)',
    nameColor: 'text-[#a16207] dark:text-[#eab308]',
    ratingColor: 'text-[#8B6F47] dark:text-[#BFAA80]',
  },
  silver: {
    ring: 'rgb(70, 70, 70)',
    inner: 'rgb(188, 188, 188)',
    nameColor: 'text-[#334155] dark:text-[#e2e8f0]',
    ratingColor: 'text-[#475569] dark:text-[#A2A2A2]',
  },
  bronze: {
    ring: 'rgb(76, 41, 28)',
    inner: 'rgb(203, 159, 147)',
    nameColor: 'text-[#334155] dark:text-[#e2e8f0]',
    ratingColor: 'text-[#475569] dark:text-[#A2A2A2]',
  },
};

const PILLAR_HEIGHT: Record<Medal, string> = {
  gold: 'h-[168px]',
  silver: 'h-[152px]',
  bronze: 'h-[144px]',
};

const ORDER: Medal[] = ['silver', 'gold', 'bronze'];

export function RankingPodium({ users }: RankingPodiumProps) {
  const byMedal = new Map<Medal, RankingUser>();
  users.forEach((u) => {
    if (u.medal) byMedal.set(u.medal, u);
  });

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        minHeight: 240,
        maskImage: 'linear-gradient(rgb(0,0,0) 95%, rgba(0,0,0,0) 100%)',
      }}
    >
      <div className="flex h-full w-full items-end justify-center gap-5 pb-10 pt-2">
        {ORDER.map((medal) => {
          const user = byMedal.get(medal);
          if (!user) return null;
          return <PodiumColumn key={medal} user={user} />;
        })}
      </div>
    </div>
  );
}

function PodiumColumn({ user }: { user: RankingUser }) {
  const medal = user.medal!;
  const palette = MEDAL_RING[medal];

  return (
    <Link
      href={user.profileUrl}
      className={cn(
        'relative w-20 transition-transform duration-200 ease-out hover:-translate-y-2',
        PILLAR_HEIGHT[medal]
      )}
    >
      <div className="absolute left-0 top-[99px] h-[200px] w-20 bg-gradient-to-r from-[#d4d4d4] via-[#f5f5f5] to-[#d4d4d4] dark:from-[#18181b] dark:via-[#27272a] dark:to-[#18181b]" />
      <div className="absolute left-0 top-[90px] h-5 w-20 rounded-full bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,#9A9A9A_16%,#C0C0C0_55%,#E0E0E0_72%,#FFFFFF_100%)] dark:bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,#313131_16%,#4A4A4A_55%,#424245_72%,#27282A_100%)]" />

      <div
        className="absolute left-0 top-[18px] h-[83px] w-20 rounded-full"
        style={{ backgroundColor: palette.ring }}
      />
      <div
        className="absolute left-0 top-[16.5px] h-20 w-20 rounded-full"
        style={{ backgroundColor: palette.inner }}
      />
      <img
        src={user.avatarUrl}
        alt={`${user.displayName} avatar`}
        className="absolute left-1/2 top-[20.5px] h-[72px] w-[72px] -translate-x-1/2 rounded-full"
      />
      <MedalIcon medal={medal} />

      <div
        className={cn(
          contestInsetCardClassName,
          'absolute left-1/2 top-[115px] flex w-24 -translate-x-1/2 flex-col items-center justify-center rounded-2xl py-2'
        )}
      >
        <div className="flex w-full items-center justify-center gap-1 px-1 text-center">
          <div
            className={cn(
              'line-clamp-1 truncate py-1 text-xs font-medium leading-none',
              palette.nameColor
            )}
          >
            {user.displayName}
          </div>
          {user.countryFlag ? (
            <div className="flex shrink-0 items-center text-sm">{user.countryFlag}</div>
          ) : null}
        </div>
        <div className={cn('text-center text-xs font-normal', palette.ratingColor)}>
          {user.rating}
        </div>
      </div>
    </Link>
  );
}

function MedalIcon({ medal }: { medal: Medal }) {
  const colors: Record<Medal, string> = {
    gold: '#eab308',
    silver: '#94a3b8',
    bronze: '#b45309',
  };
  return (
    <div
      className="absolute left-1/2 top-[-5px] grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full text-[10px] font-bold text-white shadow"
      style={{ backgroundColor: colors[medal] }}
      aria-label={`${medal} medal`}
    >
      {medal === 'gold' ? 1 : medal === 'silver' ? 2 : 3}
    </div>
  );
}
