'use client';

import type { PracticeOverview } from '../types';

import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { paths } from '@/src/routes/paths';
import { RiTelegram2Fill } from 'react-icons/ri';
import { toast } from '@/src/components/ui/sonner';
import { FaXTwitter, FaLinkedinIn } from 'react-icons/fa6';
import { CircularProgress } from '@/src/components/customized/progress/progress';
import { PRACTICE_HEADER_RING_CLASS } from '@/src/layouts/practice-surface-theme';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from '@/src/components/ui/dialog';
import {
  APP_CONFIRM_DIALOG_CONTENT_CLASS,
  APP_CONFIRM_DIALOG_OVERLAY_CLASS,
} from '@/src/components/ui/dialog-theme';
import {
  X,
  Zap,
  Mic,
  Star,
  Play,
  Files,
  Link2,
  Share2,
  PenTool,
  Headphones,
  BookOpenText,
  ChevronRight,
} from 'lucide-react';

type PracticeOverviewCardProps = {
  className?: string;
  currentQuestionLabel?: string | null;
  overview: PracticeOverview;
};

const OVERVIEW_THEME = {
  listening: {
    iconClassName: 'text-white',
    iconSurfaceClassName: 'bg-[linear-gradient(145deg,#5f34ad_0%,#8b64ff_100%)]',
    Icon: Headphones,
  },
  reading: {
    iconClassName: 'text-white',
    iconSurfaceClassName: 'bg-[linear-gradient(145deg,#8a4b14_0%,#f0a634_100%)]',
    Icon: BookOpenText,
  },
  writing: {
    iconClassName: 'text-white',
    iconSurfaceClassName: 'bg-[linear-gradient(145deg,#8b2339_0%,#ff7a59_100%)]',
    Icon: PenTool,
  },
  speaking: {
    iconClassName: 'text-white',
    iconSurfaceClassName: 'bg-[linear-gradient(145deg,#0d7c66_0%,#39d0b5_100%)]',
    Icon: Mic,
  },
  'mock-exam': {
    iconClassName: 'text-white',
    iconSurfaceClassName: 'bg-[linear-gradient(145deg,#1a4b92_0%,#4fa8ff_100%)]',
    Icon: Files,
  },
  favorites: {
    iconClassName: 'text-white',
    iconSurfaceClassName: 'bg-[linear-gradient(145deg,#8a5a00_0%,#ffb11f_55%,#ffd56a_100%)]',
    Icon: Star,
  },
} as const;

function getSectionHref(sectionType?: PracticeOverview['sectionType']) {
  switch (sectionType) {
    case 'listening':
      return paths.practice.listening.root;
    case 'reading':
      return paths.practice.reading.root;
    case 'writing':
      return paths.practice.writing.root;
    case 'speaking':
      return paths.practice.speaking.root;
    case 'mock-exam':
      return paths.mockExam.root;
    case 'favorites':
      return paths.favorites.root;
    default:
      return paths.practice.listening.root;
  }
}

type OverviewShareButtonProps = {
  overview: PracticeOverview;
  sizeClassName: string;
  tooltipClassName?: string;
  triggerClassName: string;
};

function OverviewShareButton({
  overview,
  sizeClassName,
  tooltipClassName,
  triggerClassName,
}: OverviewShareButtonProps) {
  const [open, setOpen] = useState(false);

  const sharePath = getSectionHref(overview.sectionType);
  const shareUrl =
    typeof window === 'undefined'
      ? sharePath
      : new URL(sharePath, window.location.origin).toString();
  const shareTitle = `Practice ${overview.title} on Mock4IELTS`;
  const encodedShareUrl = encodeURIComponent(shareUrl);
  const encodedShareTitle = encodeURIComponent(shareTitle);

  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=720,height=640');
    setOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied.');
      setOpen(false);
    } catch {
      toast.error('Unable to copy link right now.');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(sizeClassName, triggerClassName)}
              aria-label="Share"
            >
              <Share2 className="size-4" strokeWidth={2} />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent sideOffset={8} className={tooltipClassName}>
          Share
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        side="bottom"
        align="center"
        sideOffset={12}
        className="w-auto border-0 bg-transparent p-0 shadow-none"
      >
        <div className="relative">
          <div
            className={cn(
              'flex items-center gap-3 rounded-xl backdrop-blur-2xl px-3 py-3 text-black shadow-sm dark:text-white dark:after:bg-[#1e1e1e]!',
              PRACTICE_HEADER_RING_CLASS
            )}
          >
            <button
              type="button"
              onClick={handleCopyLink}
              aria-label="Copy link"
              className="grid size-7 place-items-center rounded-full bg-stone-100 text-stone-500 transition-colors hover:bg-stone-200 dark:bg-white/8 dark:text-white/72 dark:hover:bg-white/12"
            >
              <Link2 className="size-4" strokeWidth={2.2} />
            </button>

            <button
              type="button"
              onClick={() =>
                openShareWindow(
                  `https://t.me/share/url?url=${encodedShareUrl}&text=${encodedShareTitle}`
                )
              }
              aria-label="Share on Telegram"
              className="grid size-7 place-items-center rounded-full bg-[#229ED9] text-white transition-transform hover:scale-[1.03]"
            >
              <RiTelegram2Fill className="size-4" />
            </button>

            <button
              type="button"
              onClick={() =>
                openShareWindow(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`
                )
              }
              aria-label="Share on LinkedIn"
              className="grid size-7 place-items-center rounded-full bg-[#0A66C2] text-white transition-transform hover:scale-[1.03]"
            >
              <FaLinkedinIn className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={() =>
                openShareWindow(
                  `https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedShareTitle}`
                )
              }
              aria-label="Share on X"
              className="grid size-7 place-items-center rounded-full bg-white text-black transition-transform hover:scale-[1.03] dark:bg-[#f4f4f5]"
            >
              <FaXTwitter className="size-3.5" />
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function PracticeOverviewCard({
  className,
  currentQuestionLabel,
  overview,
}: PracticeOverviewCardProps) {
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const solvedRatio =
    overview.totalQuestions > 0 ? (overview.totalSolved / overview.totalQuestions) * 100 : 0;
  const solvedPercent = Math.max(0, Math.min(100, Math.round(solvedRatio)));
  const avgBandScore = overview.avgBandScore ?? 7.5;
  const numberFormatter = new Intl.NumberFormat('en');
  const sectionType = overview.sectionType ?? 'listening';
  const theme = OVERVIEW_THEME[sectionType];
  const OverviewIcon = theme.Icon;
  const summaryText =
    overview.summaryLabel ??
    `${overview.sourceLabel} · ${numberFormatter.format(overview.totalQuestions)} questions`;
  const actionShellClassName = 'rounded-full p-px shadow-sm transition-shadow dark:shadow-none';
  const iconActionButtonClassName =
    'grid place-items-center rounded-full bg-stone-100 text-black/78 transition-colors hover:bg-stone-200 dark:bg-white/8 dark:text-white/78 dark:hover:bg-white/12';
  const practiceButtonClassName =
    'inline-flex items-center gap-2 rounded-full border border-transparent bg-black font-semibold text-white transition-colors hover:bg-[#111111] dark:bg-white dark:text-black dark:hover:bg-stone-100';
  const cardTooltipClassName =
    'rounded-md border border-black/8 bg-white px-2.5 py-1 text-xs font-medium text-black shadow-[0_10px_24px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-[#1f1f1f] dark:text-white dark:shadow-[0_10px_24px_rgba(0,0,0,0.32)]';

  return (
    <>
      <Dialog open={isProgressOpen} onOpenChange={setIsProgressOpen}>
        <DialogContent
          showCloseButton={false}
          overlayClassName={cn(APP_CONFIRM_DIALOG_OVERLAY_CLASS, 'backdrop-blur-xl')}
          className={cn(
            APP_CONFIRM_DIALOG_CONTENT_CLASS,
            'max-w-[calc(100%-1.75rem)] p-0 shadow-md dark:bg-[#242424] dark:shadow-[0_24px_80px_rgba(0,0,0,0.42)]'
          )}
        >
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-[1.55rem] font-semibold tracking-[-0.04em] text-black sm:text-[1.7rem] dark:text-white">
                  Progress
                </DialogTitle>
              </div>

              <DialogClose className="-mr-1 inline-flex size-10 items-center justify-center rounded-full text-black/68 transition-colors hover:bg-black/6 hover:text-black dark:text-white/68 dark:hover:bg-white/6 dark:hover:text-white">
                <X className="size-5" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>

            <DialogDescription className="sr-only">
              Progress summary for {overview.title}
            </DialogDescription>

            <div className="mt-4 rounded-xl bg-[#f6f6f6] p-4 sm:p-5 dark:bg-white/6 dark:shadow-none">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative shrink-0">
                  <CircularProgress
                    value={solvedPercent}
                    size={132}
                    circleStrokeWidth={12}
                    progressStrokeWidth={12}
                    className="stroke-black/9 dark:stroke-white/16"
                    progressClassName="stroke-[#18c458]"
                  />

                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <span className="block text-2xl font-semibold leading-none tracking-[-0.03em] text-black dark:text-white">
                        {overview.totalSolved}
                        <span className="text-sm opacity-70"> / {overview.totalQuestions}</span>
                      </span>
                      <span className="block text-xs leading-none tracking-[0.08em] text-black/62 dark:text-white/55">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-black/52 dark:text-white/42">
                    AVERAGE SCORE
                  </p>
                  <p className="mt-2 whitespace-nowrap text-black dark:text-white">
                    <span className="text-[1.9rem] font-semibold leading-none tracking-[-0.03em]">
                      {avgBandScore.toFixed(1)}
                    </span>
                    <span className="ml-1 text-[1.15rem] leading-none text-black/80 dark:text-white/80">
                      Band
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <aside className={cn('text-sm', className)}>
        <div
          className={cn(
            'rounded-3xl p-4 text-black shadow-sm md:p-5 dark:text-white dark:shadow-none dark:after:!bg-[#1e1e1e]',
            PRACTICE_HEADER_RING_CLASS
          )}
        >
          <div className="md:hidden">
            <div
              className={cn(
                'mx-auto mt-3 flex size-24 items-center justify-center rounded-2xl shadow-sm dark:shadow-none',
                theme.iconSurfaceClassName
              )}
            >
              <OverviewIcon
                className={cn('size-[3.25rem]', theme.iconClassName)}
                strokeWidth={2.2}
              />
            </div>

            <h2 className="mt-5 text-center text-[clamp(2.1rem,7vw,2.55rem)] font-semibold leading-[0.94] tracking-[-0.045em] text-black dark:text-white">
              {overview.title}
            </h2>

            <p className="mt-4 text-center text-base text-black/72 dark:text-white/72">
              {summaryText}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <div className={cn(actionShellClassName, PRACTICE_HEADER_RING_CLASS)}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn(practiceButtonClassName, 'h-11 px-5 text-[15px]')}
                    >
                      <Play className="size-4 fill-white dark:fill-black" strokeWidth={2.2} />
                      Practice
                    </button>
                  </TooltipTrigger>
                  {currentQuestionLabel ? (
                    <TooltipContent sideOffset={10} className={cardTooltipClassName}>
                      {currentQuestionLabel}
                    </TooltipContent>
                  ) : null}
                </Tooltip>
              </div>

              <div className={cn(actionShellClassName, PRACTICE_HEADER_RING_CLASS)}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn('size-11', iconActionButtonClassName)}
                      aria-label="Save"
                    >
                      <Star className="size-4" strokeWidth={2} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={8} className={cardTooltipClassName}>
                    Save
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className={cn(actionShellClassName, PRACTICE_HEADER_RING_CLASS)}>
                <OverviewShareButton
                  overview={overview}
                  sizeClassName="size-11"
                  tooltipClassName={cardTooltipClassName}
                  triggerClassName={iconActionButtonClassName}
                />
              </div>
            </div>

            <div className="mt-5 border-t border-black/10 pt-5 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsProgressOpen(true)}
                className="flex min-w-0 items-center justify-between gap-3 text-left text-black transition-colors hover:text-black/88 dark:text-white dark:hover:text-white/88"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="relative shrink-0">
                    <CircularProgress
                      value={solvedPercent}
                      size={24}
                      circleStrokeWidth={3.5}
                      progressStrokeWidth={4.5}
                      className="stroke-black/9 dark:stroke-white/18"
                      progressClassName="stroke-[#18c458]"
                    />
                  </span>
                  <span className="truncate text-[1.05rem] font-semibold leading-none tracking-[-0.03em] text-black dark:text-white">
                    {overview.totalSolved}
                  </span>
                  <span className="truncate text-[0.95rem] text-black/82 dark:text-white/82">
                    Solved
                  </span>
                </div>

                <ChevronRight className="size-5 shrink-0 text-black/54 dark:text-white/54" />
              </button>
            </div>
          </div>

          <div className="hidden md:block">
            <div
              className={cn(
                'flex size-20 items-center justify-center rounded-xl shadow-sm dark:shadow-none',
                theme.iconSurfaceClassName
              )}
            >
              <div className="relative">
                <span>
                  <OverviewIcon className={cn('size-12', theme.iconClassName)} strokeWidth={2.2} />
                </span>
              </div>
            </div>

            <h2 className="mt-5 text-3xl font-semibold leading-[1.02] tracking-[-0.03em] text-black dark:text-white">
              {overview.title}
            </h2>

            <p className="mt-3 text-sm text-black/72 dark:text-white/72">{summaryText}</p>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <div className={cn(actionShellClassName, PRACTICE_HEADER_RING_CLASS)}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn(practiceButtonClassName, 'h-10 px-5 text-sm')}
                    >
                      <Play className="size-4 fill-white dark:fill-black" strokeWidth={2.2} />
                      Practice
                    </button>
                  </TooltipTrigger>
                  {currentQuestionLabel ? (
                    <TooltipContent sideOffset={10} className={cardTooltipClassName}>
                      {currentQuestionLabel}
                    </TooltipContent>
                  ) : null}
                </Tooltip>
              </div>

              <div className={cn(actionShellClassName, PRACTICE_HEADER_RING_CLASS)}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn('size-10', iconActionButtonClassName)}
                      aria-label="Save"
                    >
                      <Star className="size-4" strokeWidth={2} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={8} className={cardTooltipClassName}>
                    Save
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className={cn(actionShellClassName, PRACTICE_HEADER_RING_CLASS)}>
                <OverviewShareButton
                  overview={overview}
                  sizeClassName="size-10"
                  tooltipClassName={cardTooltipClassName}
                  triggerClassName={iconActionButtonClassName}
                />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-sm text-black/72 dark:text-white/72">
              <Zap className="size-4 text-black/72 dark:text-white/72" strokeWidth={2} />
              <span>Updated: {overview.updatedAtLabel}</span>
            </div>

            <div className="my-6 h-px bg-black/10 dark:bg-white/10" />

            <div className="mt-3 rounded-2xl bg-[#f6f6f6] p-4 sm:p-5 dark:bg-white/6 dark:shadow-none">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
                <div className="relative shrink-0">
                  <CircularProgress
                    value={solvedPercent}
                    size={144}
                    circleStrokeWidth={12}
                    progressStrokeWidth={12}
                    className="stroke-black/9 dark:stroke-white/16"
                    progressClassName="stroke-[#18c458]"
                  />

                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <span className="block text-2xl font-semibold leading-none tracking-[-0.03em] text-black dark:text-white">
                        {overview.totalSolved}
                        <span className="text-sm opacity-70"> / {overview.totalQuestions}</span>
                      </span>
                      <span className="block text-xs leading-none tracking-[0.08em] text-black/62 dark:text-white/55">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 gap-4 sm:gap-8">
                  <div>
                    <p className="text-xs font-semibold tracking-xs text-black/52 uppercase dark:text-white/42">
                      AVERAGE SCORE
                    </p>
                    <p className="mt-2 text-black dark:text-white">
                      <span className="text-2xl font-semibold leading-none tracking-[-0.03em]">
                        {avgBandScore.toFixed(1)}
                      </span>
                      <span className="ml-1 text-base leading-none text-black/80 dark:text-white/80">
                        Band
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
