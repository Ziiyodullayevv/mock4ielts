const IELTS_LISTENING_RAW_BANDS: Array<{ band: number; minRawScore: number }> = [
  { minRawScore: 39, band: 9 },
  { minRawScore: 37, band: 8.5 },
  { minRawScore: 35, band: 8 },
  { minRawScore: 32, band: 7.5 },
  { minRawScore: 30, band: 7 },
  { minRawScore: 26, band: 6.5 },
  { minRawScore: 23, band: 6 },
  { minRawScore: 18, band: 5.5 },
  { minRawScore: 16, band: 5 },
  { minRawScore: 13, band: 4.5 },
  { minRawScore: 10, band: 4 },
  { minRawScore: 8, band: 3.5 },
  { minRawScore: 6, band: 3 },
  { minRawScore: 4, band: 2.5 },
  { minRawScore: 2, band: 2 },
  { minRawScore: 1, band: 1 },
  { minRawScore: 0, band: 0 },
];

export function normalizeIeltsBand(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(9, Math.round(value * 2) / 2));
}

export function formatIeltsBand(value?: number | null) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }

  return normalizeIeltsBand(value).toFixed(1);
}

export function getIeltsListeningBandFromRawScore(score: number, total = 40) {
  if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }

  const rawScore =
    total === 40
      ? Math.round(score)
      : Math.round((Math.max(0, Math.min(score, total)) / total) * 40);

  return IELTS_LISTENING_RAW_BANDS.find(({ minRawScore }) => rawScore >= minRawScore)?.band ?? 0;
}

