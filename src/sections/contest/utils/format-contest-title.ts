type ContestDisplayTone = 'default' | 'violet';

export function formatContestDisplayTitle(title: string, tone: ContestDisplayTone) {
  const prefix = tone === 'violet' ? 'Biweekly' : 'Weekly';
  const normalizedTitle = title.replace(/\s+/g, ' ').trim();
  const withoutExistingPrefix = normalizedTitle.replace(/^(biweekly|weekly)\s+/i, '');

  return `${prefix} ${withoutExistingPrefix || 'Contest'}`;
}
