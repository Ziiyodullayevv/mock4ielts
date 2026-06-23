'use client';

import type { ReactNode, ElementType, CSSProperties } from 'react';

import { cn } from '@/src/lib/utils';
import { usePracticeTextSize, getPracticeTextStyle } from '@/src/sections/practice/shared/practice-text-size';

export const PAPER_PANEL_CLASS_NAME =
  'relative overflow-hidden rounded-lg bg-[#f7f7f7] dark:bg-[#131313]';

export const PAPER_DIVIDER_CLASS_NAME =
  "[&>*+*]:relative [&>*+*]:before:absolute [&>*+*]:before:top-0 [&>*+*]:before:left-3 [&>*+*]:before:right-3 sm:[&>*+*]:before:left-4 sm:[&>*+*]:before:right-4 [&>*+*]:before:h-px [&>*+*]:before:bg-[#dfdfdf] dark:[&>*+*]:before:bg-white/10 [&>*+*]:before:content-['']";

export const PAPER_ROW_CLASS_NAME = 'px-3 py-2 text-stone-800 dark:text-white/84 sm:px-4 sm:py-3';

const COUNT_WORD_PATTERN = 'ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|\\d+';
const ROMAN_NUMERAL_PATTERN = 'i|ii|iii|iv|v|vi|vii|viii|ix|x';
const ROMAN_NUMERAL_RANGE_REGEX = new RegExp(
  `^(?:${ROMAN_NUMERAL_PATTERN})[–-](?:${ROMAN_NUMERAL_PATTERN})$`,
  'i'
);

const INSTRUCTION_EMPHASIS_PATTERNS = [
  {
    groups: [1],
    pattern: /Choose the correct letter,\s*([A-Z](?:,\s*[A-Z])*(?:\s+or\s+[A-Z])?)/gi,
  },
  {
    groups: [1],
    pattern: /Choose the correct letter\s+([A-Z](?:,\s*[A-Z])*(?:\s+or\s+[A-Z])?)/gi,
  },
  {
    groups: [1, 2],
    pattern: new RegExp(
      `Choose\\s+((?:${COUNT_WORD_PATTERN})\\s+(?:letters?|answers?))(?:\\s+from the box)?(?:\\s+and\\s+write\\s+the\\s+correct\\s+letter)?(?:,\\s*([A-Z](?:[–-][A-Z])?|[A-Z](?:,\\s*[A-Z])*(?:\\s+or\\s+[A-Z])?))?`,
      'gi'
    ),
  },
  {
    groups: [1],
    pattern: /Choose from the options\s+([A-Z](?:[–-][A-Z])?)/gi,
  },
  {
    groups: [1],
    pattern: /\b(?:paragraphs?|letters?|options?)\s+([A-Z][–-][A-Z])\b/g,
  },
  {
    groups: [1],
    pattern: /\bcorrect\s+letter,\s*([A-Z][–-][A-Z])\b/gi,
  },
  {
    groups: [1],
    pattern: /Choose\s+(NO MORE THAN ONE WORD from the box)(?:\s+for each answer)?/gi,
  },
  {
    groups: [1],
    pattern: /Write\s+(NO MORE THAN[^.?!]*?)(?=\s+from the passage|\s+for each answer|[.?!]|$)/gi,
  },
  {
    groups: [1],
    pattern: new RegExp(
      `Write\\s+((?:NO MORE THAN\\s+)?(?:${COUNT_WORD_PATTERN})\\s+(?:WORDS?|LETTERS?|NUMBERS?)(?:\\s+AND\\/OR\\s+A\\s+NUMBER)?(?:\\s+ONLY)?)(?=\\s+for each answer|[.?!]|$)`,
      'gi'
    ),
  },
  {
    groups: [1],
    pattern: new RegExp(
      `\\b((?:NO MORE THAN\\s+)?(?:${COUNT_WORD_PATTERN})\\s+(?:WORDS?|LETTERS?|NUMBERS?)(?:\\s+AND\\/OR\\s+A\\s+NUMBER)?(?:\\s+ONLY)?)\\b`,
      'gi'
    ),
  },
  {
    groups: [1],
    pattern: /\b(TRUE|FALSE|NOT GIVEN|YES|NO|NO MORE THAN|NOT MORE THAN)\b/g,
  },
  {
    groups: [1],
    pattern: /\b([A-Z](?:[–-][A-Z]|,\s*[A-Z])*)\b(?=\s*(?:below|from the box|on the map|in the diagram|$))/gi,
  },
  {
    groups: [1],
    pattern: /\b([A-Z][–-][A-Z])\b/g,
  },
  {
    groups: [1],
    pattern: new RegExp(
      `\\b((?:${ROMAN_NUMERAL_PATTERN})[–-](?:${ROMAN_NUMERAL_PATTERN}))\\b`,
      'gi'
    ),
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

function formatInstructionEmphasis(value: string) {
  if (ROMAN_NUMERAL_RANGE_REGEX.test(value)) {
    return value.toUpperCase();
  }

  return value.replace(
    new RegExp(`\\b(${COUNT_WORD_PATTERN})\\s+(word|words|letter|letters|number|numbers)\\b`, 'gi'),
    (_match, count: string, unit: string) => `${count.toUpperCase()} ${unit.toUpperCase()}`
  );
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
      <em
        key={`${range.start}-${range.end}-${index}`}
        className="font-semibold italic text-sky-600 dark:text-sky-400"
      >
        {formatInstructionEmphasis(instruction.slice(range.start, range.end))}
      </em>
    );

    currentIndex = range.end;
  });

  if (currentIndex < instruction.length) {
    nodes.push(instruction.slice(currentIndex));
  }

  return nodes;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInstructionHtml(instruction: string) {
  const emphasisRanges = getInstructionEmphasisRanges(instruction);

  if (!emphasisRanges.length) {
    return escapeHtml(instruction);
  }

  let html = '';
  let currentIndex = 0;

  emphasisRanges.forEach((range) => {
    if (range.start > currentIndex) {
      html += escapeHtml(instruction.slice(currentIndex, range.start));
    }

    html += `<strong><em>${escapeHtml(
      formatInstructionEmphasis(instruction.slice(range.start, range.end))
    )}</em></strong>`;
    currentIndex = range.end;
  });

  if (currentIndex < instruction.length) {
    html += escapeHtml(instruction.slice(currentIndex));
  }

  return html;
}

type QuestionGroupIntroProps = {
  annotationBlockId?: string;
  instruction: string;
  renderAnnotatedTextBlock?: (args: {
    as?: ElementType;
    blockId: string;
    className?: string;
    style?: CSSProperties;
    text: string;
  }) => ReactNode;
  title: string;
  titleAnnotationBlockId?: string;
};

type QuestionNumberBadgeProps = {
  className?: string;
  isActive?: boolean;
  number: number | string;
  size?: 'md' | 'sm' | 'xs';
};

export function QuestionGroupIntro({
  annotationBlockId,
  instruction,
  renderAnnotatedTextBlock,
  title,
  titleAnnotationBlockId,
}: QuestionGroupIntroProps) {
  const textSize = usePracticeTextSize();

  return (
    <div className="space-y-2.5">
      {titleAnnotationBlockId && renderAnnotatedTextBlock ? (
        renderAnnotatedTextBlock({
          as: 'h3',
          blockId: titleAnnotationBlockId,
          className: 'font-semibold tracking-[-0.03em] text-stone-800 dark:text-white',
          style: getPracticeTextStyle(textSize, 'heading'),
          text: title,
        })
      ) : (
        <h3
          style={getPracticeTextStyle(textSize, 'heading')}
          className="font-semibold tracking-[-0.03em] text-stone-800 dark:text-white"
        >
          {title}
        </h3>
      )}
      {annotationBlockId && renderAnnotatedTextBlock ? (
        <p
          data-writing-block-id={annotationBlockId}
          style={getPracticeTextStyle(textSize, 'body-compact')}
          className="max-w-5xl font-semibold text-stone-700 dark:text-white/72 [&_em]:italic [&_strong]:font-semibold [&_strong]:text-sky-600 dark:[&_strong]:text-sky-400"
          dangerouslySetInnerHTML={{ __html: renderInstructionHtml(instruction) }}
        />
      ) : (
        <p
          style={getPracticeTextStyle(textSize, 'body-compact')}
          className="max-w-5xl font-semibold text-stone-700 dark:text-white/72"
        >
          {renderInstruction(instruction)}
        </p>
      )}
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
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.74rem] font-semibold tabular-nums tracking-[-0.03em] align-middle transition-colors',
        isActive
          ? 'border border-[#ffb347] bg-[linear-gradient(135deg,#ffc85a_0%,#ff9f2f_55%,#ff784b_100%)] text-white'
          : 'bg-[#e8e8ec] text-stone-800 dark:bg-white/10 dark:text-white/74',
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
  titleContent?: React.ReactNode;
};

type PaperSurfaceProps = {
  children: React.ReactNode;
  className?: string;
  n?: number;
  radius?: number;
};

export function PaperSurface({ children, className, n = 4, radius = 38 }: PaperSurfaceProps) {
  void n;
  void radius;

  return (
    <div className={cn(PAPER_PANEL_CLASS_NAME, className)}>
      {children}
    </div>
  );
}

export function PaperPanel({
  bodyClassName,
  children,
  className,
  title,
  titleClassName,
  titleContent,
}: PaperPanelProps) {
  const textSize = usePracticeTextSize();

  return (
    <PaperSurface className={className}>
      {title || titleContent ? (
        <div
          style={getPracticeTextStyle(textSize, 'body')}
          className={cn(
            'border-b border-[#dfdfdf] px-3 py-2.5 font-semibold tracking-[-0.02em] text-stone-900 dark:border-white/10 dark:text-white sm:px-4 sm:py-3',
            titleClassName
          )}
        >
          {titleContent ?? title}
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </PaperSurface>
  );
}
