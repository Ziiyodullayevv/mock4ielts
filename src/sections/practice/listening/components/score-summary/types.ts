export type PartMetric = {
  partNumber: number;
  percentage: number;
  score: number;
  total: number;
};

export type PartTone = {
  gradient: string;
};

export type PerformanceTheme = {
  glow: string;
  pillBackground: string;
  ring: string;
};

export type ScoreSummaryViewModel = {
  accuracy: number;
  answeredCount: number;
  bestPartLabel: string;
  cefrDescription: string;
  cefrLevel: string;
  completionRate: number;
  displayBand: string;
  needsReviewLabel: string;
  partMetrics: PartMetric[];
  partCount: number;
  remainingCount: number;
  score: number;
  theme: PerformanceTheme;
  timeSpentDetail: string;
  timeSpentLabel: string;
  total: number;
};
