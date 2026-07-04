import {
  PRACTICE_HEADER_RING_CLASS,
  PRACTICE_MENU_PANEL_RING_CLASS,
} from '@/src/layouts/practice-surface-theme';

export const contestPanelClassName = `${PRACTICE_MENU_PANEL_RING_CLASS} text-[#0f172a] shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] dark:text-white dark:shadow-none`;

export const contestInsetCardClassName = `${PRACTICE_MENU_PANEL_RING_CLASS} text-[#0f172a] shadow-[0_8px_18px_rgba(15,23,42,0.06),0_2px_8px_rgba(15,23,42,0.04)] dark:text-white dark:shadow-none`;

export const contestSegmentedClassName = `${PRACTICE_MENU_PANEL_RING_CLASS} rounded-full p-1 text-[#475569] shadow-[0_8px_18px_rgba(15,23,42,0.06),0_2px_8px_rgba(15,23,42,0.04)] dark:text-white/70 dark:shadow-none`;

export const contestSegmentActiveClassName =
  'border border-[#ffb347] bg-[linear-gradient(135deg,#ffc85a_0%,#ff9f2f_55%,#ff784b_100%)] text-white shadow-[0_12px_28px_rgba(255,120,75,0.24)] hover:brightness-105 dark:shadow-[0_12px_28px_rgba(255,120,75,0.18)]';

export const contestSegmentInactiveClassName =
  'bg-transparent text-[#64748b] hover:text-[#0f172a] dark:text-white/70 dark:hover:text-white';

export const contestButtonClassName = `${PRACTICE_HEADER_RING_CLASS} inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-[#0f172a] shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] transition-colors hover:text-black dark:text-white/85 dark:shadow-none`;

export const contestIconButtonClassName = `${PRACTICE_HEADER_RING_CLASS} inline-grid place-items-center rounded-full text-[#0f172a] shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] transition-colors hover:text-black dark:text-white/85 dark:shadow-none`;

export const contestPrimaryButtonClassName =
  'inline-flex items-center justify-center rounded-full border border-[#ffb347] bg-[linear-gradient(135deg,#ffc85a_0%,#ff9f2f_55%,#ff784b_100%)] text-white shadow-[0_12px_28px_rgba(255,120,75,0.24)] transition-[transform,filter,box-shadow] duration-200 hover:brightness-105 active:scale-[0.98] dark:shadow-[0_12px_28px_rgba(255,120,75,0.18)]';
