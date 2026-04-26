import type { Country } from '@/src/components/ui/country-dropdown';
import type { ProfileFormState } from '@/src/sections/profile/types/profile-form';

import { countries } from 'country-data-list';

export const AVAILABLE_COUNTRIES = countries.all.filter(
  (country: Country) => country.emoji && country.status !== 'deleted' && country.ioc !== 'PRK'
) as Country[];

export const EMPTY_FORM_STATE: ProfileFormState = {
  avatar: '',
  country: 'Uzbekistan',
  countryRegionCode: 'UZB',
  countryRegionOfResidence: 'Uzbekistan',
  dateOfBirth: undefined,
  email: '',
  firstName: '',
  gender: 'male',
  lastName: '',
  phone: '',
  phoneCountryIso: 'UZ',
};

export const profilePageBackgroundClassName =
  'min-h-screen bg-white px-4 text-stone-950 sm:px-6 dark:bg-[#050505] dark:[background-image:radial-gradient(circle_at_top,rgba(255,159,47,0.10),transparent_22%)] dark:text-white';

export const profileLabelClassName =
  'mb-3 block text-[17px] font-semibold tracking-[-0.02em] text-stone-900 dark:text-white/92';

export const profileInputClassName =
  'h-[52px] w-full rounded-xl border border-stone-200 bg-white px-4 text-[15px] text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#ff9f2f] focus:bg-white dark:border-white/14 dark:bg-white/[0.03] dark:text-white/92 dark:placeholder:text-white/34 dark:focus:bg-white/[0.05]';

export const profileDropdownSurfaceClassName =
  'overflow-hidden rounded-xl border border-stone-200 !bg-white p-0 !text-stone-900 shadow-[0_18px_50px_rgba(15,23,42,0.12)] dark:border-white/10 dark:!bg-[#101011] dark:!text-white dark:shadow-[0_18px_50px_rgba(0,0,0,0.48)]';

export const profileDropdownCommandClassName =
  'bg-transparent text-stone-900 [&_[data-slot=command-input-wrapper]]:border-stone-200 [&_[data-slot=command-input-wrapper]]:bg-stone-50 [&_[data-slot=command-input-wrapper]_svg]:text-stone-400 [&_[data-slot=command-input]]:text-stone-900 [&_[data-slot=command-input]]:placeholder:text-stone-400 [&_[data-slot=command-empty]]:text-stone-500 [&_[data-slot=command-group]]:text-stone-800 [&_[data-slot=command-item]]:bg-transparent [&_[data-slot=command-item]]:text-stone-800 [&_[data-slot=command-item][data-selected=true]]:bg-[#ff9f2f] [&_[data-slot=command-item][data-selected=true]]:text-white [&_[data-slot=command-item][data-selected=true]_svg]:text-white dark:text-white dark:[&_[data-slot=command-input-wrapper]]:border-white/10 dark:[&_[data-slot=command-input-wrapper]]:bg-white/[0.03] dark:[&_[data-slot=command-input-wrapper]_svg]:text-white/40 dark:[&_[data-slot=command-input]]:text-white dark:[&_[data-slot=command-input]]:placeholder:text-white/35 dark:[&_[data-slot=command-empty]]:text-white/45 dark:[&_[data-slot=command-group]]:text-white/88 dark:[&_[data-slot=command-item]]:text-white/88';

export const profileDateDropdownClassName =
  'overflow-hidden rounded-xl border border-stone-200 bg-white p-0 text-stone-900 shadow-[0_18px_50px_rgba(15,23,42,0.12)] [&_[data-slot=calendar]]:bg-transparent [&_.rdp-button_previous]:border-stone-200 [&_.rdp-button_previous]:bg-stone-50 [&_.rdp-button_previous]:text-stone-900 hover:[&_.rdp-button_previous]:bg-stone-100 [&_.rdp-button_next]:border-stone-200 [&_.rdp-button_next]:bg-stone-50 [&_.rdp-button_next]:text-stone-900 hover:[&_.rdp-button_next]:bg-stone-100 [&_.rdp-caption_label]:text-stone-900 [&_.rdp-dropdown_root]:border-stone-200 [&_.rdp-dropdown_root]:bg-stone-50 [&_.rdp-dropdown_root]:text-stone-900 [&_.rdp-weekday]:text-stone-500 [&_.rdp-day_button]:text-stone-800 [&_.rdp-day_button:hover]:bg-stone-100 [&_.rdp-day_button:hover]:text-stone-900 [&_.rdp-day_button[data-selected-single=true]]:bg-[#ff9f2f] [&_.rdp-day_button[data-selected-single=true]]:text-white hover:[&_.rdp-day_button[data-selected-single=true]]:bg-[#ffab44] [&_.rdp-today]:bg-stone-100 [&_.rdp-today]:text-stone-900 dark:border-white/10 dark:bg-[#101011] dark:text-white dark:shadow-[0_18px_50px_rgba(0,0,0,0.48)] dark:[&_.rdp-button_previous]:border-white/10 dark:[&_.rdp-button_previous]:bg-white/[0.03] dark:[&_.rdp-button_previous]:text-white dark:hover:[&_.rdp-button_previous]:bg-white/[0.06] dark:[&_.rdp-button_next]:border-white/10 dark:[&_.rdp-button_next]:bg-white/[0.03] dark:[&_.rdp-button_next]:text-white dark:hover:[&_.rdp-button_next]:bg-white/[0.06] dark:[&_.rdp-caption_label]:text-white dark:[&_.rdp-dropdown_root]:border-white/10 dark:[&_.rdp-dropdown_root]:bg-white/[0.03] dark:[&_.rdp-dropdown_root]:text-white dark:[&_.rdp-weekday]:text-white/45 dark:[&_.rdp-day_button]:text-white/88 dark:[&_.rdp-day_button:hover]:bg-white/[0.06] dark:[&_.rdp-day_button:hover]:text-white dark:[&_.rdp-today]:bg-white/[0.08] dark:[&_.rdp-today]:text-white';
