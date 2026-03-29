import type { QuestionBankItem } from '../types';

import Link from 'next/link';
import { cn } from '@/src/lib/utils';
import { Star, Check, Award, Circle } from 'lucide-react';
import { TokenIcon } from '@/src/components/icons/token-icon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip';

import { QuestionBankSkillBadge } from './question-bank-skill-badge';

type QuestionBankRowProps = {
  index: number;
  item: QuestionBankItem;
};

const ATTEMPT_COUNT_FORMATTER = new Intl.NumberFormat('en', {
  maximumFractionDigits: 1,
  notation: 'compact',
});
const ATTEMPT_TOOLTIP_FORMATTER = new Intl.NumberFormat('en');

function getAttemptLabel(attemptCount?: number): string {
  const count = Math.max(0, attemptCount ?? 0);
  return ATTEMPT_COUNT_FORMATTER.format(count).toLowerCase();
}

function QuestionBankRowLock({
  bandScore,
  isCompleted,
  isLocked,
  tokenCost,
}: {
  bandScore?: number;
  isCompleted?: boolean;
  isLocked?: boolean;
  tokenCost?: number;
}) {
  if (isCompleted) {
    const displayBand = bandScore ?? 6.0;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex items-center justify-center gap-1">
            <Award className="size-4 text-[#ffc31a]" strokeWidth={2.1} />
            <span className="text-sm font-semibold leading-none whitespace-nowrap text-white">
              {displayBand.toFixed(1)}
            </span>
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={3}
          className="border border-white/8 bg-white/8 text-white shadow-sm backdrop-blur-2xl"
        >
          <p>Band score: {displayBand.toFixed(1)}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (!isLocked) {
    return <span className="block h-6 w-full" aria-hidden="true" />;
  }

  const displayTokenCost = tokenCost ?? 10;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex items-center justify-center gap-1 text-link-active">
          <TokenIcon className="text-[14px]" />
          <span className="text-sm font-semibold leading-none">{displayTokenCost}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={3}
        className="border border-white/8 bg-white/8 text-white shadow-sm backdrop-blur-2xl"
      >
        <p>Unlock: {displayTokenCost} tokens</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function QuestionBankRow({ index, item }: QuestionBankRowProps) {
  const hasCardBackground = index % 2 === 0;
  const attemptLabel = getAttemptLabel(item.attemptCount);
  const attemptCount = Math.max(0, item.attemptCount ?? 0);
  const statusTooltipLabel = item.isCompleted ? 'Completed' : 'Not completed';
  const attemptTooltipLabel = `${ATTEMPT_TOOLTIP_FORMATTER.format(attemptCount)} ${
    attemptCount === 1 ? 'attempt' : 'attempts'
  }`;

  return (
    <Link
      href={item.href}
      className={cn(
        'group flex min-h-3 items-center gap-4 rounded-xl px-5 py-3 transition-colors duration-200',
        hasCardBackground ? 'bg-white/8' : 'bg-transparent'
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex shrink-0 items-center justify-center">
              {item.isCompleted ? (
                <Check className="size-4 text-[#18c458]" strokeWidth={2.4} />
              ) : (
                <Circle className="size-4 text-white/72" strokeWidth={1.9} />
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={3}
            className="border border-white/8 bg-white/8 text-white shadow-sm backdrop-blur-2xl"
          >
            <p>{statusTooltipLabel}</p>
          </TooltipContent>
        </Tooltip>

        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-[-0.03em]">
            {item.id}. {item.title}
          </h3>
          {item.subtitle ? (
            <p className="mt-1 truncate text-xs tracking-[-0.02em] text-white/52">{item.subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="ml-3 grid shrink-0 grid-cols-[7.3rem_7.6rem_4.5rem_2.25rem] items-center gap-x-2.5 sm:ml-4 sm:gap-x-3">
        <div className="justify-self-start">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center text-sm font-medium tracking-[-0.01em] text-white/72 whitespace-nowrap">
                {attemptLabel}
              </span>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              sideOffset={0}
              className="bg-white/8 border border-white/8 backdrop-blur-2xl text-white shadow-sm **:data-radix-tooltip-arrow:hidden"
            >
              <p>{attemptTooltipLabel}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="justify-self-start">
          <QuestionBankSkillBadge skill={item.skill} />
        </div>

        <div className="flex h-9 items-center justify-center">
          <QuestionBankRowLock
            bandScore={item.bandScore}
            isCompleted={item.isCompleted}
            isLocked={item.isLocked}
            tokenCost={item.tokenCost}
          />
        </div>

        <div className="flex h-9 items-center justify-center">
          <span
            className={cn(
              'grid size-8 place-items-center rounded-xl transition-all duration-200 hover:bg-white/8',
              item.isStarred ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}
          >
            <Star
              className={cn(
                'size-4 transition-transform duration-200 group-hover:scale-105',
                item.isStarred ? 'fill-[#ffc31a] text-[#ffc31a]' : 'text-white/78'
              )}
              strokeWidth={1.9}
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
