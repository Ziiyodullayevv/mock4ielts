import Link from 'next/link';
import { cn } from '@/src/lib/utils';
import { contestInsetCardClassName } from '../contest-theme';

import type { RankingUser } from '../../types';

type RankingListProps = {
  users: RankingUser[];
};

export function RankingList({ users }: RankingListProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {users.map((user, index) => (
        <RankingListItem key={user.username} user={user} delayMs={index * 90} />
      ))}
    </div>
  );
}

function RankingListItem({ user, delayMs }: { user: RankingUser; delayMs: number }) {
  return (
    <Link
      href={user.profileUrl}
      className={cn(
        contestInsetCardClassName,
        'flex h-16 w-full cursor-pointer items-center gap-4 rounded-2xl px-4 py-2 after:transition-colors duration-200 hover:after:bg-[#f8fafc] dark:hover:after:bg-[#1a1a1a]'
      )}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="grid w-5 place-items-center rounded-full bg-[#f1f5f9] text-xs leading-5 text-[#334155] dark:bg-[#404040] dark:text-white">
        {user.rank}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={user.avatarUrl}
        alt={`${user.displayName} avatar`}
        loading="lazy"
        className="h-7 w-7 shrink-0 rounded-full outline outline-1 -outline-offset-[0.5px] outline-[rgba(226,232,240,0.8)] dark:outline-white/5"
      />

      <div className="flex min-w-0 flex-1 items-center justify-between overflow-hidden">
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <div className="line-clamp-1 truncate text-sm font-medium leading-5 text-[#0f172a] dark:text-white">
            {user.displayName}
          </div>
          {user.countryFlag ? (
            <div className="flex-none text-sm">{user.countryFlag}</div>
          ) : null}
        </div>

        <div className="ml-3 inline-flex h-10 shrink-0 flex-col items-end justify-center text-xs">
          <div className="inline-flex items-center gap-0.5">
            <span className="leading-4 text-[#64748b] dark:text-[#a1a1aa]">Rating:</span>
            <span className="w-8 text-right leading-4 text-[#1e293b] dark:text-white">
              {user.rating}
            </span>
          </div>
          <div className="inline-flex items-center gap-0.5">
            <span className="leading-4 text-[#64748b] dark:text-[#a1a1aa]">Attended:</span>
            <span className="leading-4 text-[#334155] dark:text-white/80">
              {user.attended}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
