'use client';

import type { FAQItem } from './types';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { faqItems } from '../home/data';

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex w-full max-w-none flex-col gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-2 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:max-w-200 sm:px-6 dark:border-white/8 dark:bg-white/8 dark:shadow-none">
      <button
        type="button"
        onClick={onToggle}
        className="mt-3.5 flex w-full items-center justify-between gap-4 text-left font-semibold text-stone-950 dark:text-white"
      >
        <div className="text-base font-medium sm:text-lg">{item.question}</div>
        <Plus className="size-5 text-stone-500 dark:text-white/72" />
      </button>

      <div
        className={`overflow-hidden transition-all w-full duration-300 ease-in-out ${
          isOpen ? 'max-h-250 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="w-full text-sm leading-6 text-stone-600 dark:text-white/72">{item.answer}</div>
      </div>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="relative mx-auto my-16 flex max-w-280 flex-col gap-10 px-4 sm:px-6 lg:my-20 lg:flex-row lg:gap-20">
      <div className="flex flex-col">
        <h2 className="max-w-sm text-[34px] font-medium leading-[1.2] text-stone-950 sm:text-[42px] lg:text-[48px] dark:text-white">
          Frequently Asked Questions
        </h2>

        <div className="mt-5 max-w-[320px] text-[14px] leading-6 text-stone-600 md:mb-5.5 md:mt-6 md:leading-5.5 dark:text-white/65">
          Find answers to common questions about Mock4IELTS, including practice sections, mock
          exams, pricing, and support.
        </div>
      </div>

      <div className="flex flex-col gap-3 md:mr-0 md:items-center">
        {faqItems.map((item, index) => (
          <FAQAccordionItem
            key={item.question}
            item={item}
            isOpen={openIndex === index}
            onToggle={() => toggleItem(index)}
          />
        ))}
      </div>
    </section>
  );
}
