import type { TestResult } from '../../types';
import type { PartMetric, PerformanceTheme, ScoreSummaryViewModel } from './types';

function bandScore(score: number, total: number): string {
  if (!total) {
    return '0.0';
  }

  const pct = score / total;
  if (pct >= 0.97) return '9.0';
  if (pct >= 0.93) return '8.5';
  if (pct >= 0.87) return '8.0';
  if (pct >= 0.8) return '7.5';
  if (pct >= 0.73) return '7.0';
  if (pct >= 0.67) return '6.5';
  if (pct >= 0.6) return '6.0';
  if (pct >= 0.53) return '5.5';
  if (pct >= 0.47) return '5.0';
  if (pct >= 0.4) return '4.5';

  return '4.0';
}

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

function formatBand(bandValue: number) {
  const formatted = bandValue.toFixed(1);

  return formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted;
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
  const bandValue =
    typeof result.overallBand === 'number' && Number.isFinite(result.overallBand)
      ? result.overallBand
      : Number.parseFloat(bandScore(result.score, result.total));
  const displayBand = formatBand(bandValue);
  const answeredCount = Object.keys(result.answers).filter((value) =>
    result.answers[value]?.trim()
  ).length;
  const accuracy = result.total ? Math.round((result.score / result.total) * 100) : 0;
  const completionRate = result.total ? Math.round((answeredCount / result.total) * 100) : 0;
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
    remainingCount: Math.max(result.total - result.score, 0),
    score: result.score,
    theme: getPerformanceTheme(bandValue),
    timeSpentDetail:
      result.timeSpentSeconds != null ? 'Recorded session duration' : 'Timer data unavailable',
    timeSpentLabel: formatDuration(result.timeSpentSeconds),
    total: result.total,
  };
}
