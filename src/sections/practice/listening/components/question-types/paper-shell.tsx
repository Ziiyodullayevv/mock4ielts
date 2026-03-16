'use client';

import { cn } from '@/src/lib/utils';

export const PAPER_PANEL_CLASS_NAME =
  'overflow-hidden bg-[#f5f5f7]';

export const PAPER_ROW_CLASS_NAME = 'px-8 py-5 text-stone-800';

type QuestionGroupIntroProps = {
  instruction: string;
  title: string;
};

export function QuestionGroupIntro({ instruction, title }: QuestionGroupIntroProps) {
  return (
    <div className="space-y-5">
      <h3 className="text-[1.4rem] font-semibold tracking-[-0.03em] text-stone-800 md:text-[1.65rem]">
        {title}
      </h3>
      <p className="max-w-5xl text-[1.02rem] leading-8 text-stone-700">{instruction}</p>
    </div>
  );
}

type PaperPanelProps = {
  bodyClassName?: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleClassName?: string;
};

export function PaperPanel({
  bodyClassName,
  children,
  className,
  title,
  titleClassName,
}: PaperPanelProps) {
  return (
    <section className={cn(PAPER_PANEL_CLASS_NAME, className)}>
      {title ? (
        <div
          className={cn(
            'bg-[#414042] px-8 py-5 text-[1rem] font-semibold tracking-[-0.02em] text-white',
            titleClassName
          )}
        >
          {title}
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
