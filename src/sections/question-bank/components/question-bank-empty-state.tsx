export function QuestionBankEmptyState() {
  return (
    <div className="rounded-[32px] border border-dashed border-white/12 bg-white/3 px-6 py-14 text-center">
      <p className="text-xl font-semibold tracking-[-0.02em] text-white">
        No matching practice sets found
      </p>
      <p className="mt-3 text-sm leading-6 text-white/52">
        Try another keyword or switch the skill filter to see more IELTS question bank items.
      </p>
    </div>
  );
}
