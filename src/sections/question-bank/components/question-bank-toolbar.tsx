import { Funnel, Search, Shuffle, ArrowUpDown } from 'lucide-react';

type QuestionBankToolbarProps = {
  completed: number;
  progressPercent: number;
  total: number;
};

export function QuestionBankToolbar({
  completed,
  progressPercent,
  total,
}: QuestionBankToolbarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <label className="relative max-w-[280px] flex-1">
          <Search className="pointer-events-none absolute left-6 top-1/2 size-4 -translate-y-1/2 text-white/36" />

          <input
            placeholder="Search questions"
            className="h-11 w-full rounded-full text-sm bg-white/8 pl-13 pr-5 font-medium placeholder:text-sm tracking-[-0.03em] text-white outline-none placeholder:text-white/52"
          />
        </label>

        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full  bg-white/8 text-white/70"
          aria-label="Sort questions"
        >
          <ArrowUpDown className="size-4" />
        </button>

        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full bg-white/8 text-white/70"
          aria-label="Filter questions"
        >
          <Funnel className="size-4" />
        </button>
      </div>

      <div className="ml-auto flex items-center gap-4 text-white/68">
        <div className="flex items-center gap-3">
          <div
            className="relative size-5 rounded-full"
            style={{
              background: `conic-gradient(rgb(38 199 93) ${progressPercent}%, rgba(255, 255, 255, 0.12) ${progressPercent}% 100%)`,
            }}
          >
            <div className="absolute inset-[3px] rounded-full bg-black" />
          </div>

          <p className="text-sm tracking-[-0.02em] text-white/72">
            <span className="text-white">{completed}</span>/{total} Solved
          </p>
        </div>

        <button
          type="button"
          className="flex size-11 hover:bg-white/8 items-center justify-center rounded-full text-white/52"
          aria-label="Refresh question bank"
        >
          <Shuffle className="size-4" />
        </button>
      </div>
    </div>
  );
}
