import type { LucideIcon } from 'lucide-react';
import type { QuestionBankSkill } from '../types';

import { cn } from '@/src/lib/utils';
import { Mic, PenTool, Headphones, BookOpenText } from 'lucide-react';

const SKILL_BADGES: Record<
  QuestionBankSkill,
  {
    icon: LucideIcon;
    className: string;
  }
> = {
  Listening: {
    className: 'text-[#36d8ff]',
    icon: Headphones,
  },
  Reading: {
    className: 'text-[#2fe38d]',
    icon: BookOpenText,
  },
  Speaking: {
    className: 'text-[#ff4d4f]',
    icon: Mic,
  },
  Writing: {
    className: 'text-[#ffc31a]',
    icon: PenTool,
  },
};

type QuestionBankSkillBadgeProps = {
  skill: QuestionBankSkill;
};

export function QuestionBankSkillBadge({ skill }: QuestionBankSkillBadgeProps) {
  const badge = SKILL_BADGES[skill];
  const SkillIcon = badge.icon;

  return (
    <span
      className={cn(
        'inline-flex h-9 items-center gap-1.5 text-sm font-medium tracking-[-0.01em] whitespace-nowrap',
        badge.className
      )}
    >
      <SkillIcon className="size-4" strokeWidth={2.1} />
      {skill}
    </span>
  );
}
