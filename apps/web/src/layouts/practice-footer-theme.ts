import {
  PRACTICE_FOOTER_CARD_RING_CLASS,
  PRACTICE_FOOTER_BUTTON_RING_CLASS,
} from './practice-surface-theme';

export const PRACTICE_FOOTER_SHELL_CLASS =
  'fixed inset-x-0 bottom-0 z-30 w-screen overflow-hidden border-t border-black/8 bg-background text-black shadow-[0_-12px_32px_rgba(15,23,42,0.08)] dark:border-white/10 dark:text-white dark:shadow-none';

export const PRACTICE_FOOTER_TOP_BAR_CLASS =
  'hidden';

export const PRACTICE_FOOTER_DARK_CARD_RING_CLASS = PRACTICE_FOOTER_CARD_RING_CLASS;

export const PRACTICE_FOOTER_DARK_BUTTON_RING_CLASS = PRACTICE_FOOTER_BUTTON_RING_CLASS;

export const PRACTICE_FOOTER_INACTIVE_SURFACE_CLASS =
  "relative overflow-hidden border-0 border-transparent bg-transparent shadow-md before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-to-tl before:from-[#d8dce2] before:via-[#f6f7f9] before:to-[#d8dce2] before:content-[''] after:absolute after:inset-px after:rounded-[inherit] after:bg-white after:content-[''] [&>*]:relative [&>*]:z-10 hover:after:bg-stone-50 dark:border-transparent dark:bg-transparent dark:before:from-white/14 dark:before:via-[#151515]/78 dark:before:to-white/14 dark:after:bg-[#131313] dark:hover:after:bg-[#1a1a1a]";

export const PRACTICE_FOOTER_ACTIVE_BUTTON_CLASS =
  'border-[#ffb347] bg-[linear-gradient(135deg,#ffb347_0%,#ff9f2f_52%,#ffb347_100%)] text-white';

export const PRACTICE_HEADER_ACTIVE_BUTTON_CLASS =
  'border-[#ffb347] bg-[linear-gradient(135deg,#ffc85a_0%,#ff9f2f_55%,#ff784b_100%)] text-white';

export const PRACTICE_FOOTER_ACTIVE_SURFACE_CLASS =
  "relative overflow-hidden border-0 border-transparent bg-transparent shadow-md before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-to-tl before:from-[#ffb347] before:via-[#ff9f2f] before:to-[#ffb347] before:content-[''] after:absolute after:inset-px after:rounded-[inherit] after:bg-white after:content-[''] [&>*]:relative [&>*]:z-10 hover:after:bg-[#fffdfa] dark:border-transparent dark:bg-transparent dark:before:from-[#ffb347] dark:before:via-[#ff9f2f] dark:before:to-[#ffb347] dark:after:bg-[#131313] dark:hover:after:bg-[#1a1a1a]";

export const PRACTICE_FOOTER_ACTIVE_BADGE_CLASS =
  'bg-[linear-gradient(135deg,#ffb347_0%,#ff9f2f_52%,#ffb347_100%)] text-white';
