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
  'min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,159,47,0.08),transparent_20%),#050505] px-4 text-white sm:px-6';

export const profileLabelClassName =
  'mb-3 block text-[17px] font-semibold tracking-[-0.02em] text-white/92';

export const profileInputClassName =
  'h-[56px] w-full rounded-xl border border-white/14 bg-white/[0.03] px-4 text-[16px] text-white/92 outline-none transition placeholder:text-white/34 focus:border-[#ff9f2f] focus:bg-white/[0.05]';

export const profileDropdownSurfaceClassName =
  'rounded-xl border border-white/10 !bg-[#101011] p-0 !text-white shadow-[0_18px_50px_rgba(0,0,0,0.48)]';

export const profileDropdownCommandClassName =
  'bg-transparent text-white [&_[data-slot=command-input-wrapper]]:border-white/10 [&_[data-slot=command-input-wrapper]]:bg-white/[0.03] [&_[data-slot=command-input-wrapper]_svg]:text-white/40 [&_[data-slot=command-input]]:text-white [&_[data-slot=command-input]]:placeholder:text-white/35 [&_[data-slot=command-empty]]:text-white/45 [&_[data-slot=command-group]]:text-white/88 [&_[data-slot=command-item]]:bg-transparent [&_[data-slot=command-item]]:text-white/88 [&_[data-slot=command-item][data-selected=true]]:bg-[#ff9f2f] [&_[data-slot=command-item][data-selected=true]]:text-white [&_[data-slot=command-item][data-selected=true]_svg]:text-white';

export const profileDateDropdownClassName =
  'rounded-xl border border-white/10 bg-[#101011] p-0 text-white shadow-[0_18px_50px_rgba(0,0,0,0.48)] [&_[data-slot=calendar]]:bg-transparent [&_.rdp-button_previous]:border-white/10 [&_.rdp-button_previous]:bg-white/[0.03] [&_.rdp-button_previous]:text-white hover:[&_.rdp-button_previous]:bg-white/[0.06] [&_.rdp-button_next]:border-white/10 [&_.rdp-button_next]:bg-white/[0.03] [&_.rdp-button_next]:text-white hover:[&_.rdp-button_next]:bg-white/[0.06] [&_.rdp-caption_label]:text-white [&_.rdp-dropdown_root]:border-white/10 [&_.rdp-dropdown_root]:bg-white/[0.03] [&_.rdp-dropdown_root]:text-white [&_.rdp-weekday]:text-white/45 [&_.rdp-day_button]:text-white/88 [&_.rdp-day_button:hover]:bg-white/[0.06] [&_.rdp-day_button:hover]:text-white [&_.rdp-day_button[data-selected-single=true]]:bg-[#ff9f2f] [&_.rdp-day_button[data-selected-single=true]]:text-white hover:[&_.rdp-day_button[data-selected-single=true]]:bg-[#ffab44] [&_.rdp-today]:bg-white/[0.08] [&_.rdp-today]:text-white';
