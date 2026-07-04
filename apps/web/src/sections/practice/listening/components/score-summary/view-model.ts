import type { TestResult } from '../../types';
import type { PartMetric, PerformanceTheme, ScoreSummaryViewModel } from './types';

import {
  formatIeltsBand,
  normalizeIeltsBand,
  getIeltsListeningBandFromRawScore,
} from '@/src/sections/practice/utils/ielts-band-score';

function getPartMetrics(result: TestResult): PartMetric[] {
  return Object.entries(result.partScores)
    .map(([partNumber, values]) => ({
      partNumber: Number(partNumber),
      percentage: values.total ? Math.round((values.score / values.total) * 100) : 0,
      score: values.score,
      total: values.total,
    }))
    .sort((a, b) => a.partNumber - b.partNumber);
}

function getCefrLevel(bandValue: number) {
  if (bandValue >= 8) return 'C2';
  if (bandValue >= 6.5) return 'C1';
  if (bandValue >= 5.5) return 'B2';
  if (bandValue >= 4) return 'B1';

  return 'A2';
}

function getCefrDescription(level: string) {
  if (level === 'C2') return 'Proficient user';
  if (level === 'C1') return 'Advanced user';
  if (level === 'B2') return 'Upper-intermediate';
  if (level === 'B1') return 'Intermediate user';

  return 'Foundational level';
}

function formatDuration(seconds: number | null | undefined) {
  if (seconds == null || !Number.isFinite(seconds)) {
    return '--';
  }

  const rounded = Math.max(0, Math.round(seconds));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const remainingSeconds = rounded % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  }

  return `${minutes}m ${String(remainingSeconds).padStart(2, '0')}s`;
}

function getPerformanceTheme(bandValue: number): PerformanceTheme {
  if (bandValue >= 7.5) {
    return {
      glow: 'drop-shadow(0 0 12px rgba(0, 255, 153, 0.3))',
      pillBackground: 'rgba(255,255,255,0.12)',
      ring: '#39d46a',
    };
  }

  if (bandValue >= 5.5) {
    return {
      glow: 'drop-shadow(0 0 12px rgba(164,132,255,0.32))',
      pillBackground: 'rgba(255,255,255,0.12)',
      ring: '#8b5cf6',
    };
  }

  return {
    glow: 'drop-shadow(0 0 12px rgba(255,186,110,0.24))',
    pillBackground: 'rgba(255,255,255,0.1)',
    ring: '#ffb020',
  };
}

export function buildScoreSummaryViewModel(result: TestResult): ScoreSummaryViewModel {
  const score = Math.round(result.score);
  const total = Math.round(result.total);
  const bandValue = normalizeIeltsBand(getIeltsListeningBandFromRawScore(score, total));
  const displayBand = formatIeltsBand(bandValue);
  const answeredCount = Object.keys(result.answers).filter((value) =>
    result.answers[value]?.trim()
  ).length;
  const accuracy = total ? Math.round((score / total) * 100) : 0;
  const completionRate = total ? Math.round((answeredCount / total) * 100) : 0;
  const partMetrics = getPartMetrics(result);
  const hasSuccessfulPart = partMetrics.some((part) => part.score > 0);
  const strongestPart = partMetrics.reduce(
    (best, current) => (current.percentage > best.percentage ? current : best),
    partMetrics[0] ?? { partNumber: 1, percentage: 0, score: 0, total: 0 }
  );
  const weakestPart = partMetrics.reduce(
    (worst, current) => (current.percentage < worst.percentage ? current : worst),
    partMetrics[0] ?? { partNumber: 1, percentage: 0, score: 0, total: 0 }
  );
  const cefrLevel = getCefrLevel(bandValue);

  return {
    accuracy,
    answeredCount,
    bestPartLabel: hasSuccessfulPart ? `Part ${strongestPart.partNumber}` : 'N/A',
    cefrDescription: getCefrDescription(cefrLevel),
    cefrLevel,
    completionRate,
    displayBand,
    needsReviewLabel: hasSuccessfulPart ? `Part ${weakestPart.partNumber}` : 'N/A',
    partCount: partMetrics.length || 4,
    partMetrics,
    remainingCount: Math.max(total - score, 0),
    score,
    theme: getPerformanceTheme(bandValue),
    timeSpentDetail:
      result.timeSpentSeconds != null ? 'Recorded session duration' : 'Timer data unavailable',
    timeSpentLabel: formatDuration(result.timeSpentSeconds),
    total,
  };
}
