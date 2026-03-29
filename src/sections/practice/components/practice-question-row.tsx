'use client';

import type { PracticeQuestionItem } from '../types';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { TokenIcon } from '@/src/components/icons/token-icon';
import { X, Mic, Zap, Star, Check, Timer, Circle, BookOpen, Headphones } from 'lucide-react';
import {
  Sheet,
  SheetClose,
  SheetTitle,
  SheetHeader,
  SheetContent,
  SheetDescription,
} from '@/src/components/ui/sheet';

type PracticeQuestionRowProps = {
  animationDelayMs?: number;
  enableEntranceAnimation?: boolean;
  index: number;
  item: PracticeQuestionItem;
};

const ATTEMPT_COUNT_FORMATTER = new Intl.NumberFormat('en', {
  maximumFractionDigits: 1,
  notation: 'compact',
});

export function PracticeQuestionRow({
  animationDelayMs = 0,
  enableEntranceAnimation = false,
  index,
  item,
}: PracticeQuestionRowProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const hasCardBackground = index % 2 === 0;
  const attemptLabel = item.questionCount
    ? `${item.questionCount} q`
    : ATTEMPT_COUNT_FORMATTER.format(item.attemptCount).toLowerCase();
  const requiredTokenCount = item.tokenCost ?? 0;

  return (
    <Sheet open={isInfoOpen} onOpenChange={setIsInfoOpen}>
      <motion.div
        initial={enableEntranceAnimation ? { opacity: 0, y: 8 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: animationDelayMs / 1000,
          duration: 0.18,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div
          className={cn(
            'group grid min-h-10 grid-cols-[minmax(0,1fr)_3.8rem_3.2rem_2rem] items-center gap-x-2 rounded-xl px-3 py-1.5 text-sm transition-colors sm:grid-cols-[minmax(0,1fr)_4.8rem_4.4rem_2.3rem] sm:gap-x-3 sm:px-3',
            hasCardBackground ? 'bg-white/8' : 'bg-transparent'
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-4 shrink-0 place-items-center">
              {item.isCompleted ? (
                <Check className="size-4 text-[#18c458]" strokeWidth={2.3} />
              ) : (
                <Circle className="size-4 text-white/72" strokeWidth={1.9} />
              )}
            </span>

            <button
              type="button"
              onClick={() => setIsInfoOpen(true)}
              className="truncate text-left text-sm font-semibold tracking-[-0.02em] text-white/92 transition-colors hover:text-link-active"
            >
              {item.id}. {item.title}
            </button>
          </div>

          <p className="justify-self-start text-sm font-medium tabular-nums text-white/66">
            {attemptLabel}
          </p>

          <div className="justify-self-start">
            {item.tokenCost ? (
              <span className="inline-flex items-center gap-1 text-link-active">
                <TokenIcon className="text-[14px]" />
                <span className="text-sm font-semibold leading-none">{item.tokenCost}</span>
              </span>
            ) : (
              <span className="block h-4 w-8" aria-hidden="true" />
            )}
          </div>

          <div className="justify-self-end">
            <span className="grid size-7 place-items-center rounded-lg transition-colors group-hover:bg-white/8 sm:size-8">
              <Star
                className={cn(
                  'size-4 transition-all duration-200',
                  item.isStarred
                    ? 'fill-[#ffc31a] text-[#ffc31a]'
                    : 'text-white/78 group-hover:fill-[#ffc31a] group-hover:text-[#ffc31a]'
                )}
                strokeWidth={1.95}
              />
            </span>
          </div>
        </div>
      </motion.div>

      <SheetContent
        side="bottom"
        showCloseButton={false}
        overlayClassName="bg-black/55 backdrop-blur-xl data-[state=open]:duration-200 data-[state=closed]:duration-150"
        className="h-[96vh] rounded-t-2xl border-0 bg-[#141414] p-0 text-white data-[state=open]:duration-200 data-[state=closed]:duration-150 data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:slide-out-to-bottom-2"
      >
        <SheetClose className="absolute -top-6 right-6 z-20 inline-flex items-center justify-center text-white/72 transition-all duration-200 ease-out data-[state=closed]:translate-y-1 data-[state=closed]:opacity-0 data-[state=open]:translate-y-0 data-[state=open]:opacity-100 hover:text-white focus:outline-none">
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </SheetClose>

        <div className="mx-auto h-full w-full max-w-5xl overflow-y-auto px-5 pb-8 pt-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-8">
          <SheetHeader className="sticky top-0 z-10 -mx-5 border-b border-white/8 bg-[#141414]/95 px-5 py-4 text-left backdrop-blur-md sm:-mx-8 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 pr-2">
                <SheetTitle className="text-3xl font-semibold tracking-[-0.02em] text-[#ff9f2f] sm:text-4xl">
                  About IELTS Listening
                </SheetTitle>
                <SheetDescription className="sr-only">
                  IELTS listening section details and structure.
                </SheetDescription>
              </div>

              <Link
                href={item.href}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#ff9f2f] px-5 text-sm font-semibold text-black transition-colors hover:bg-[#ffab44]"
              >
                Start Practice
              </Link>
            </div>
          </SheetHeader>

          <div className="space-y-7 py-6 text-sm">
            <p className="text-sm text-white/70">
              Question {item.id} - {item.title}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 font-medium text-white/95">
                <Headphones className="size-4 text-[#ff9f2f]" />
                {item.questionCount ?? 40} Questions
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 font-medium text-white/95">
                <Timer className="size-4 text-[#ff9f2f]" />
                {item.durationMinutes ?? 35} minutes
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 font-medium text-[#0f9cff]">
                <TokenIcon className="text-[15px]" />
                {requiredTokenCount > 0
                  ? `${requiredTokenCount} token required`
                  : 'No token required'}
              </span>
            </div>

            <div className="rounded-xl bg-white/6 p-4 sm:p-5">
              <p className="mb-3 text-base font-semibold text-white/95">
                What this set helps you improve
              </p>
              <p className="text-sm leading-7 text-white/78">
                This mock follows the real IELTS Listening flow with natural speed audio,
                distractors, and detail-focused questions. It is designed to strengthen your
                concentration, answer selection speed, and spelling accuracy under time pressure.
              </p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                <div className="inline-flex items-center gap-2 text-white/86">
                  <Mic className="size-4 text-[#ff9f2f]" />
                  Topic recognition in fast speech
                </div>
                <div className="inline-flex items-center gap-2 text-white/86">
                  <BookOpen className="size-4 text-[#ff9f2f]" />
                  Gap-fill and form completion focus
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-base font-semibold text-white/94">
                The IELTS listening exam covers:
              </p>

              <ul className="list-disc space-y-4 pl-5 text-sm leading-7 text-white/82 marker:text-[#ff9f2f]">
                <li>
                  <span className="font-semibold text-white">Part 1:</span> A conversation between
                  two people set in an everyday social context (e.g., a conversation between a
                  customer and a hotel receptionist).
                </li>
                <li>
                  <span className="font-semibold text-white">Part 2:</span> A monologue set in an
                  everyday social context (e.g., a speech about local facilities or services).
                </li>
                <li>
                  <span className="font-semibold text-white">Part 3:</span> A conversation between 2
                  to 4 people set in an educational or training context (e.g., a university tutor
                  and students discussing an assignment).
                </li>
                <li>
                  <span className="font-semibold text-white">Part 4:</span> A monologue on an
                  academic subject (e.g., a university lecture).
                </li>
              </ul>
            </div>

            <div className="rounded-xl bg-white/6 p-4 sm:p-5">
              <p className="inline-flex items-center gap-2 text-base font-semibold text-white/94">
                <Zap className="size-4 text-[#ff9f2f]" />
                Before you start
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-white/78">
                <li>Use headphones for clearer details and speaker transitions.</li>
                <li>Keep 1-2 minutes for quick answer review at the end.</li>
                <li>
                  {requiredTokenCount > 0
                    ? `This mock requires ${requiredTokenCount} tokens to start.`
                    : 'This mock can be started without token payment.'}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
