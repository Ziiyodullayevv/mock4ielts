'use client';

import type { RankingTab } from '../../types';

import { cn } from '@/src/lib/utils';

import {
  contestSegmentedClassName,
  contestSegmentActiveClassName,
  contestSegmentInactiveClassName,
} from '../contest-theme';

type RankingTabsProps = {
  active: RankingTab;
  onChange: (tab: RankingTab) => void;
};

const TABS: { id: RankingTab; label: string }[] = [
  { id: 'global', label: 'Global' },
  { id: 'llm', label: 'LLM' },
];

export function RankingTabs({ active, onChange }: RankingTabsProps) {
  return (
    <div className={cn(contestSegmentedClassName, 'inline-flex')}>
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'cursor-pointer rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all duration-300',
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
