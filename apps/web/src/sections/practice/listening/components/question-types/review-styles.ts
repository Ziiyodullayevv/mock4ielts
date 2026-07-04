export const REVIEW_STYLE = {
  correctBadge:
    'border-[#22C55E]/25 bg-[#D3FCD2]/75 text-[#118D57] dark:border-[#22C55E]/35 dark:bg-[#22C55E]/14 dark:text-[#77ED8B]',
  correctFill: 'border-[#22C55E] bg-[#22C55E] text-white',
  correctRow:
    'bg-[#D3FCD2]/45 text-[#118D57] dark:bg-[#22C55E]/12 dark:text-[#77ED8B]',
  correctText: 'text-[#118D57] dark:text-[#77ED8B]',
  wrongBadge:
    'border-[#FF5630]/25 bg-[#FFE9D5]/85 text-[#B71D18] dark:border-[#FF5630]/35 dark:bg-[#FF5630]/14 dark:text-[#FFAC82]',
  wrongFill: 'border-[#FF5630] bg-[#FF5630] text-white',
  wrongRow:
    'bg-[#FFE9D5]/85 text-[#B71D18] dark:bg-[#FF5630]/12 dark:text-[#FFAC82]',
  wrongText: 'text-[#B71D18] dark:text-[#FFAC82]',
} as const;

export function getReviewValueLabel(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue ? `Your answer: ${normalizedValue}` : 'No answer';
}
