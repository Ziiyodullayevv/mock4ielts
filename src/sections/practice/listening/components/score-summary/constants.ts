import type { PartTone } from './types';

export const SUMMARY_CARD_BACKGROUND =
  'radial-gradient(circle_at_top_left,rgba(134,239,172,0.12),transparent 28%),radial-gradient(circle_at_82%_16%,rgba(74,222,128,0.08),transparent 24%),linear-gradient(135deg,rgba(47,122,86,0.82) 0%,rgba(29,92,70,0.72) 48%,rgba(18,57,45,0.64) 100%)';

export const SUMMARY_CARD_GLOW = 'drop-shadow(0 0 14px rgba(134,239,172,0.12))';

export const PART_TONES: PartTone[] = [
  { gradient: 'linear-gradient(90deg,#ff6b6d 0%,#ff3b3f 100%)' },
  { gradient: 'linear-gradient(90deg,#3dd5ec 0%,#20b8d9 100%)' },
  { gradient: 'linear-gradient(90deg,#ffc85a 0%,#ffb020 100%)' },
  { gradient: 'linear-gradient(90deg,#66e08f 0%,#39d46a 100%)' },
] as const;

export const SHARED_CIRCLE_STROKE = 12;
export const SHARED_PROGRESS_STROKE = 23;
export const MINI_CARD_CIRCLE_STROKE = 6;
export const MINI_CARD_PROGRESS_STROKE = 13;
