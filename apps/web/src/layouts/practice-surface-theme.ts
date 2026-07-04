const PRACTICE_LIGHT_RING_CLASS =
  "relative overflow-hidden !border-0 !bg-transparent before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-to-tl before:from-[#d8dce2] before:via-[#f6f7f9] before:to-[#d8dce2] before:content-[''] after:absolute after:inset-px after:rounded-[inherit] after:content-[''] [&>*]:relative [&>*]:z-10";

const PRACTICE_DARK_RING_CLASS =
  "dark:relative dark:overflow-hidden dark:!border-0 dark:!bg-transparent dark:before:absolute dark:before:inset-0 dark:before:rounded-[inherit] dark:before:bg-linear-to-tl dark:before:from-white/14 dark:before:via-[#151515]/78 dark:before:to-white/14 dark:before:content-[''] dark:after:absolute dark:after:inset-px dark:after:rounded-[inherit] dark:after:content-[''] dark:[&>*]:relative dark:[&>*]:z-10";

export const PRACTICE_HEADER_RING_CLASS = `${PRACTICE_LIGHT_RING_CLASS} ${PRACTICE_DARK_RING_CLASS} after:bg-white dark:after:bg-[#141414]`;

export const PRACTICE_HEADER_ACTIVE_RING_CLASS =
  "relative overflow-hidden !border-0 !bg-transparent before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(135deg,#ffc85a_0%,#ff9f2f_55%,#ff784b_100%)] before:content-[''] after:absolute after:inset-px after:rounded-[inherit] after:bg-white after:content-[''] [&>*]:relative [&>*]:z-10 dark:after:bg-[#141414]";

export const PRACTICE_MENU_PANEL_RING_CLASS = `${PRACTICE_LIGHT_RING_CLASS} ${PRACTICE_DARK_RING_CLASS} after:bg-white dark:after:bg-[#141414]`;

export const PRACTICE_TIMER_RING_CLASS = `${PRACTICE_LIGHT_RING_CLASS} ${PRACTICE_DARK_RING_CLASS} after:bg-white dark:after:bg-[#131313]`;

export const PRACTICE_FOOTER_CARD_RING_CLASS =
  "relative overflow-hidden !border-0 !bg-transparent before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-to-tl before:from-[#d8dce2] before:via-[#f6f7f9] before:to-[#d8dce2] before:content-[''] after:absolute after:inset-[0.5px] after:rounded-[inherit] after:bg-white after:content-[''] [&>*]:relative [&>*]:z-10 dark:!border-0 dark:!bg-transparent dark:before:from-white/14 dark:before:via-[#151515]/78 dark:before:to-white/14 dark:after:bg-[#131313]";

// Same gradient border but with a light-gray inner surface (for #f7f7f7 background cards)
export const PRACTICE_CARD_RING_GRAY_CLASS =
  "relative overflow-hidden !border-0 !bg-transparent before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-to-tl before:from-[#d8dce2] before:via-[#f6f7f9] before:to-[#d8dce2] before:content-[''] after:absolute after:inset-[0.5px] after:rounded-[inherit] after:bg-[#f7f7f7] after:content-[''] [&>*]:relative [&>*]:z-10 dark:!border-0 dark:!bg-transparent dark:before:from-white/14 dark:before:via-[#151515]/78 dark:before:to-white/14 dark:after:bg-[#1a1a1a]";

export const PRACTICE_FOOTER_BUTTON_RING_CLASS =
  "relative overflow-hidden !border-0 !bg-transparent before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-to-tl before:from-[#d8dce2] before:via-[#f6f7f9] before:to-[#d8dce2] before:content-[''] after:absolute after:inset-[0.5px] after:rounded-[inherit] after:bg-white after:content-[''] [&>*]:relative [&>*]:z-10 dark:!border-0 dark:!bg-transparent dark:before:from-white/14 dark:before:via-[#151515]/78 dark:before:to-white/14 dark:after:bg-[#1a1a1a]";
