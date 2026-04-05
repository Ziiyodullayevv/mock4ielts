'use client';

import { cn } from '@/src/lib/utils';
import { Squircle } from '@/src/components/squircle/squircle';

export const PAPER_PANEL_CLASS_NAME =
  'relative overflow-hidden bg-[#f7f7f7] shadow-[0_10px_24px_rgba(15,23,42,0.05),0_2px_8px_rgba(15,23,42,0.035)]';

export const PAPER_DIVIDER_CLASS_NAME =
  "[&>*+*]:relative [&>*+*]:before:absolute [&>*+*]:before:top-0 [&>*+*]:before:left-5 [&>*+*]:before:right-5 sm:[&>*+*]:before:left-8 sm:[&>*+*]:before:right-8 [&>*+*]:before:h-px [&>*+*]:before:bg-[#dfdfdf] [&>*+*]:before:content-['']";

export const PAPER_ROW_CLASS_NAME = 'px-5 py-4 text-stone-800 sm:px-8 sm:py-6';

const INSTRUCTION_EMPHASIS_PATTERNS = [
  {
    groups: [1],
    pattern: /Choose the correct letter,\s*([A-Z](?:,\s*[A-Z])*(?:\s+or\s+[A-Z])?)/gi,
  },
  {
    groups: [1, 2],
    pattern:
      /Choose\s+(ONE|TWO|THREE|FOUR|FIVE|\d+)\s+(?:letters?|answers?)(?:\s+from the box)?(?:,\s*([A-Z](?:[–-][A-Z])?|[A-Z](?:,\s*[A-Z])*(?:\s+or\s+[A-Z])?))?/gi,
  },
  {
    groups: [1],
    pattern: /Choose from the options\s+([A-Z](?:[–-][A-Z])?)/gi,
  },
  {
    groups: [1],
    pattern: /Choose\s+(NO MORE THAN ONE WORD from the box)(?:\s+for each answer)?/gi,
  },
  {
    groups: [1],
    pattern: /Write\s+(NO MORE THAN[^.?!]*?)(?=\s+for each answer|[.?!]|$)/gi,
  },
  {
    groups: [1],
    pattern: /You may use\s+(any letter more than once)/gi,
  },
];

function getInstructionEmphasisRanges(instruction: string) {
  const ranges: Array<{ start: number; end: number }> = [];

  INSTRUCTION_EMPHASIS_PATTERNS.forEach(({ groups, pattern }) => {
    for (const match of instruction.matchAll(pattern)) {
      const start = match.index;
      const matchedText = match[0];

      if (typeof start !== 'number' || !matchedText) {
        continue;
      }

      let searchCursor = 0;

      groups.forEach((groupIndex) => {
        const groupValue = match[groupIndex];

        if (!groupValue) {
          return;
        }

        const groupOffset = matchedText.indexOf(groupValue, searchCursor);

        if (groupOffset === -1) {
          return;
        }

        ranges.push({
          start: start + groupOffset,
          end: start + groupOffset + groupValue.length,
        });

        searchCursor = groupOffset + groupValue.length;
      });
    }
  });

  return ranges
    .sort((left, right) => left.start - right.start)
    .reduce<Array<{ start: number; end: number }>>((merged, range) => {
      const previousRange = merged.at(-1);

      if (!previousRange || range.start > previousRange.end) {
        merged.push(range);
        return merged;
      }

      previousRange.end = Math.max(previousRange.end, range.end);
      return merged;
    }, []);
}

function renderInstruction(instruction: string) {
  const emphasisRanges = getInstructionEmphasisRanges(instruction);

  if (!emphasisRanges.length) {
    return instruction;
  }

  const nodes: Array<string | React.JSX.Element> = [];
  let currentIndex = 0;

  emphasisRanges.forEach((range, index) => {
    if (range.start > currentIndex) {
      nodes.push(instruction.slice(currentIndex, range.start));
    }

    nodes.push(
      <strong key={`${range.start}-${range.end}-${index}`} className="font-semibold text-stone-900">
        {instruction.slice(range.start, range.end)}
      </strong>
    );

    currentIndex = range.end;
  });

  if (currentIndex < instruction.length) {
    nodes.push(instruction.slice(currentIndex));
  }

  return nodes;
}

type QuestionGroupIntroProps = {
  instruction: string;
  title: string;
};

type QuestionNumberBadgeProps = {
  className?: string;
  isActive?: boolean;
  number: number | string;
  size?: 'md' | 'sm' | 'xs';
};

export function QuestionGroupIntro({ instruction, title }: QuestionGroupIntroProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-[1.2rem] font-semibold tracking-[-0.03em] text-stone-800 md:text-[1.35rem]">
        {title}
      </h3>
      <p className="max-w-5xl text-base leading-7 text-stone-700">
        {renderInstruction(instruction)}
      </p>
    </div>
  );
}

export function QuestionNumberBadge({
  className,
  isActive,
  number,
}: QuestionNumberBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.92rem] font-semibold tabular-nums tracking-[-0.03em] align-middle transition-colors',
        isActive ? 'bg-blue-600 text-white' : 'bg-[#e8e8ec] text-stone-800',
        className
      )}
    >
      {number}
    </span>
  );
}

type PaperPanelProps = {
  bodyClassName?: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleClassName?: string;
};

type PaperSurfaceProps = {
  children: React.ReactNode;
  className?: string;
};

export function PaperSurface({ children, className }: PaperSurfaceProps) {
  return (
    <Squircle n={4} radius={38} className={cn(PAPER_PANEL_CLASS_NAME, className)}>
      {children}
    </Squircle>
  );
}

export function PaperPanel({
  bodyClassName,
  children,
  className,
  title,
  titleClassName,
}: PaperPanelProps) {
  return (
    <PaperSurface className={className}>
      {title ? (
        <div
          className={cn(
            'border-b border-[#dfdfdf] px-5 py-4 text-[1.05rem] font-semibold tracking-[-0.02em] text-stone-900 sm:px-8 sm:py-6',
            titleClassName
          )}
        >
          {title}
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </PaperSurface>
  );
}
