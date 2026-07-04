export type ContestDisplayTone = 'default' | 'violet';

const getExplicitContestTone = (title: string): ContestDisplayTone | null => {
  if (/^biweekly\b/i.test(title)) {
    return 'violet';
  }

  if (/^weekly\b/i.test(title)) {
    return 'default';
  }

  return null;
};

export function getContestDisplayTone(
  title: string,
  fallback: ContestDisplayTone = 'default'
): ContestDisplayTone {
  const normalizedTitle = title.replace(/\s+/g, ' ').trim();

  return getExplicitContestTone(normalizedTitle) ?? fallback;
}

export function formatContestDisplayTitle(title: string, tone: ContestDisplayTone) {
  const prefix = tone === 'violet' ? 'Biweekly' : 'Weekly';
  const normalizedTitle = title.replace(/\s+/g, ' ').trim();
  const explicitTone = getExplicitContestTone(normalizedTitle);

  if (explicitTone) {
    return normalizedTitle;
  }

  const withoutExistingPrefix = normalizedTitle.replace(/^(biweekly|weekly)\s+/i, '');

  return `${prefix} ${withoutExistingPrefix || 'Contest'}`;
}
