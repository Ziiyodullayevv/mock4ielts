import type { ReactNode } from 'react';

type BenefitItem = {
  title: string;
  highlight: string;
  description: string;
  icon: ReactNode;
};

export function BenefitCard({ item }: { item: BenefitItem }) {
  return (
    <div className="flex w-79 flex-col max-lg:w-70 max-md:w-full max-md:items-center">
      <div className="flex h-11 w-18 items-center justify-center rounded-full border-2 border-[#006aff] bg-[#006aff]/12 text-[#006aff] shadow-[0_0_0_1px_rgba(52,137,255,0.08)_inset] dark:bg-[#006aff]/60 dark:text-white dark:shadow-[0px_0px_14px_0px_#3489FF_inset]">
        {item.icon}
      </div>

      <div className="mt-4 flex flex-col max-md:items-center">
        <h3 className="text-[28px] font-semibold leading-[1.15] text-stone-950 max-md:text-center max-md:text-[24px] dark:text-white">
          {item.title}
        </h3>
        <span className="text-[28px] leading-[1.15] text-[#2882FF] max-md:text-[24px]">
          {item.highlight}
        </span>
      </div>

      <p className="mt-4 text-[14px] leading-6.5 text-stone-600 max-md:max-w-85 max-md:text-center dark:text-white/60">
        {item.description}
      </p>
    </div>
  );
}
