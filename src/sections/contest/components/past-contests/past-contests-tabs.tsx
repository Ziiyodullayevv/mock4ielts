'use client';

import { cn } from '@/src/lib/utils';
import {
  contestSegmentActiveClassName,
  contestSegmentedClassName,
  contestSegmentInactiveClassName,
} from '../contest-theme';

import type { PastContestTab } from '../../types';

type PastContestsTabsProps = {
  active: PastContestTab;
  onChange: (tab: PastContestTab) => void;
};

const TABS: { id: PastContestTab; label: string }[] = [
  { id: 'past', label: 'Past Contests' },
  { id: 'mine', label: 'My Contests' },
];

export function PastContestsTabs({ active, onChange }: PastContestsTabsProps) {
  return (
    <div className={cn(contestSegmentedClassName, 'inline-flex !p-1 text-xs font-medium')}>
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'h-9 cursor-pointer rounded-full px-3 py-2 text-sm font-medium transition-all duration-150',
              isActive
                ? contestSegmentActiveClassName
                : contestSegmentInactiveClassName
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
