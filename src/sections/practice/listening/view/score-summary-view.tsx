'use client';

import type { TestResult } from '../types';

import { Award, Timer, TrendingUp } from 'lucide-react';

import {
  MiniStatCard,
  OverallScoreCard,
  QuickSummaryCard,
  PartBreakdownCard,
  SummaryMetricCard,
  buildScoreSummaryViewModel,
} from '../components/score-summary';

type ScoreSummaryViewProps = {
  result: TestResult;
};

export function ScoreSummaryView({ result }: ScoreSummaryViewProps) {
  const viewModel = buildScoreSummaryViewModel(result);

  return (
    <div className="space-y-4 text-base">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.83fr)]">
        <section className="rounded-2xl bg-white/8 p-3 shadow-[0_24px_56px_rgba(0,0,0,0.3)]">
          <div className="grid gap-3 lg:grid-cols-[minmax(250px,0.92fr)_minmax(0,1fr)]">
            <QuickSummaryCard viewModel={viewModel} />
            <PartBreakdownCard viewModel={viewModel} />

            <MiniStatCard
              accent="#ff4d4f"
              detail={`${viewModel.score} correct answers`}
              label="Accuracy"
              percentage={viewModel.accuracy}
              value={`${viewModel.accuracy}%`}
            />
            <MiniStatCard
              accent="#ffb020"
              detail={`${viewModel.answeredCount}/${viewModel.total} answered`}
              label="Completion"
              percentage={viewModel.completionRate}
              value={`${viewModel.completionRate}%`}
            />
          </div>
        </section>

        <OverallScoreCard viewModel={viewModel} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryMetricCard
          accentClassName="text-[#ffb020]"
          detail={viewModel.cefrDescription}
          icon={Award}
          label="CEFR Level"
          value={viewModel.cefrLevel}
        />
        <SummaryMetricCard
          accentClassName="text-[#20b8d9]"
          detail={viewModel.timeSpentDetail}
          icon={Timer}
          label="Total Time Taken"
          value={viewModel.timeSpentLabel}
        />
        <SummaryMetricCard
          accentClassName="text-[#39d46a]"
          detail={`${viewModel.score}/${viewModel.total} correct answers`}
          icon={TrendingUp}
          label="Success Rate"
          value={`${viewModel.accuracy}%`}
        />
      </div>
    </div>
  );
}
