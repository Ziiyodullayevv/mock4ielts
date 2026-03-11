import { QUESTION_BANK_ITEMS, QUESTION_BANK_SUMMARY } from './data';
import { QuestionBankList, QuestionBankToolbar, QuestionBankTemplatesCarousel } from './components';

export function QuestionBankShell() {
  const progressPercent = (QUESTION_BANK_SUMMARY.completed / QUESTION_BANK_SUMMARY.total) * 100;

  return (
    <main className="min-h-screen pt-25">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-5 xl:px-[80px]">
        <QuestionBankTemplatesCarousel />

        <div className="pt-4 sm:pt-5">
          <QuestionBankToolbar
            completed={QUESTION_BANK_SUMMARY.completed}
            progressPercent={progressPercent}
            total={QUESTION_BANK_SUMMARY.total}
          />
        </div>

        <QuestionBankList items={QUESTION_BANK_ITEMS} />
      </div>
    </main>
  );
}
