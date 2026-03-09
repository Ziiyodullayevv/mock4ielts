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
    <div className="flex w-full max-w-200 flex-col gap-3 bg-white/8 rounded-2xl px-6 py-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full mt-3.5 items-center justify-between gap-4 text-left font-semibold"
      >
        <div className="font-medium text-lg">{item.question}</div>
        <Plus className="size-5" />
      </button>

      <div
        className={`overflow-hidden transition-all w-full duration-300 ease-in-out ${
          isOpen ? 'max-h-250 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="text-sm leading-5 w-full">{item.answer}</div>
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
    <section className="relative max-w-280 mx-auto my-20 flex gap-20">
      <div className="flex flex-col">
        <h2 className="text-[54px] max-w-sm leading-[1.4] font-medium md:text-[36px] lg:text-[48px]">
          Frequently Asked Questions
        </h2>

        <div className="mt-6 w-99 text-[14px] leading-7 text-system-text03 md:mt-6 md:mb-5.5 md:w-64 md:leading-5.5 lg:w-[320px]">
          Find answers to common questions about Mock4IELTS, including practice sections, mock
          exams, pricing, and support.
        </div>
      </div>

      <div className="flex  flex-col gap-3 md:mr-0 md:items-center">
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
