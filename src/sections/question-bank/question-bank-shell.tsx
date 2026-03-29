'use client';

import { useQuestionBankItemsQuery } from './hooks/use-question-bank-items-query';
import { QuestionBankList, QuestionBankToolbar, QuestionBankTemplatesCarousel } from './components';

export function QuestionBankShell() {
  const { data, error, isFetching, isLoading, refetch } = useQuestionBankItemsQuery();
  const summary = data?.summary ?? { completed: 0, total: 0 };
  const progressPercent = summary.total ? (summary.completed / summary.total) * 100 : 0;

  return (
    <main className="min-h-screen pt-25">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-5 xl:px-[80px]">
        <QuestionBankTemplatesCarousel />

        <div className="pt-4 sm:pt-5">
          <QuestionBankToolbar
            completed={summary.completed}
            isRefreshing={isFetching}
            onRefresh={() => {
              void refetch();
            }}
            progressPercent={progressPercent}
            total={summary.total}
          />
        </div>

        {isLoading ? (
          <div className="rounded-[32px] border border-dashed border-white/12 bg-white/3 px-6 py-14 text-center">
            <p className="text-xl font-semibold tracking-[-0.02em] text-white">
              Loading question bank...
            </p>
            <p className="mt-3 text-sm leading-6 text-white/52">
              Published section questions are being fetched now.
            </p>
          </div>
        ) : error instanceof Error ? (
          <div className="rounded-[32px] border border-dashed border-white/12 bg-white/3 px-6 py-14 text-center">
            <p className="text-xl font-semibold tracking-[-0.02em] text-white">
              Could not load question bank
            </p>
            <p className="mt-3 text-sm leading-6 text-white/52">{error.message}</p>
          </div>
        ) : (
          <QuestionBankList items={data?.items ?? []} />
        )}
      </div>
    </main>
  );
}
