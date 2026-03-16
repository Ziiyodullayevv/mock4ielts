'use client';

import type { TestResult } from '../types';

interface Props {
  result: TestResult;
  onReview: () => void;
  onRetry: () => void;
}

function bandScore(score: number, total: number): string {
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

function bandColor(band: string): string {
  const n = parseFloat(band);
  if (n >= 7.5) return 'text-green-600 dark:text-green-400';
  if (n >= 6.0) return 'text-blue-600 dark:text-blue-400';
  if (n >= 5.0) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

export function ScoreSummary({ result, onReview, onRetry }: Props) {
  const band = bandScore(result.score, result.total);

  return (
    <div className="max-w-lg mx-auto space-y-6 py-6">
      {/* Main score card */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 text-center border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your result</p>
          <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            {result.score}
            <span className="text-xl font-medium text-gray-400">/{result.total}</span>
          </p>
          <p className={`text-2xl font-bold mt-1 ${bandColor(band)}`}>Band {band}</p>
        </div>

        {/* Per-part breakdown */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {Object.entries(result.partScores).map(([partNum, ps]) => (
            <div key={partNum} className="flex items-center justify-between px-6 py-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">Part {partNum}</span>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${(ps.score / ps.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 tabular-nums w-10 text-right">
                  {ps.score}/{ps.total}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Try again
        </button>
        <button
          onClick={onReview}
          className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-medium text-white transition-colors"
        >
          Review answers
        </button>
      </div>
    </div>
  );
}
