import type { Country } from '@/src/components/ui/country-dropdown';
import type { UserProfile, UserProfileUpdateInput } from '@/src/auth/api/profile-api';
import type { Gender, ProfileFormState } from '@/src/sections/profile/types/profile-form';

import { format, parseISO } from 'date-fns';
import { AVAILABLE_COUNTRIES } from '@/src/sections/profile/constants/profile-form';

const trimToNull = (value: string) => {
  const normalizedValue = value.trim();

  return normalizedValue.length ? normalizedValue : null;
};

const normalizeCountryCodeValue = (value: string) =>
  value.replace(/\s+/g, '').replace(/^\+/, '').toUpperCase();

const findCountryByName = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  const normalizedValue = value.trim().toLowerCase();

  return AVAILABLE_COUNTRIES.find((country) => country.name.toLowerCase() === normalizedValue);
};

const findCountryByCode = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  const normalizedValue = normalizeCountryCodeValue(value);

  return AVAILABLE_COUNTRIES.find(
    (country) =>
      country.alpha2.toUpperCase() === normalizedValue ||
      country.alpha3.toUpperCase() === normalizedValue ||
      country.countryCallingCodes.some(
        (callingCode) => normalizeCountryCodeValue(callingCode) === normalizedValue
      )
  );
};

const getCallingCodeByAlpha2 = (value: string) => {
  const country = AVAILABLE_COUNTRIES.find((entry) => entry.alpha2 === value.toUpperCase());

  return country?.countryCallingCodes[0] ?? null;
};

const normalizeGender = (value?: string | null): Gender =>
  value?.toLowerCase() === 'female' ? 'female' : 'male';

const toDateValue = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  const parsedDate = parseISO(value);

  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
};

export const getProfileAvatarFallback = (formState: ProfileFormState) =>
  formState.firstName.charAt(0).toUpperCase() || 'A';

export const toFormState = (profile: UserProfile): ProfileFormState => {
  const residenceCountry =
    findCountryByCode(profile.countryRegionCode) ??
    findCountryByName(profile.countryRegionOfResidence) ??
    findCountryByName(profile.country) ??
    findCountryByCode(profile.country);
  const phoneCountry =
    findCountryByCode(profile.phoneCountryCode) ??
    residenceCountry ??
    AVAILABLE_COUNTRIES.find((country) => country.alpha2 === 'UZ');

  return {
    avatar: profile.avatar ?? '',
    country: profile.country ?? residenceCountry?.name ?? '',
    countryRegionCode: residenceCountry?.alpha3 ?? profile.countryRegionCode ?? 'UZB',
    countryRegionOfResidence:
      profile.countryRegionOfResidence ?? residenceCountry?.name ?? profile.country ?? '',
    dateOfBirth: toDateValue(profile.dateOfBirth),
    email: profile.email,
    firstName: profile.firstName ?? '',
    gender: normalizeGender(profile.gender),
    lastName: profile.lastName ?? '',
    phone: profile.phone ?? '',
    phoneCountryIso: phoneCountry?.alpha2 ?? 'UZ',
  };
};

export const buildUpdatePayload = (formState: ProfileFormState): UserProfileUpdateInput => {
  const firstName = trimToNull(formState.firstName);
  const lastName = trimToNull(formState.lastName);
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const phone = trimToNull(formState.phone);

  return {
    country: trimToNull(formState.country) ?? trimToNull(formState.countryRegionOfResidence),
    country_region_code: trimToNull(formState.countryRegionCode),
    country_region_of_residence: trimToNull(formState.countryRegionOfResidence),
    date_of_birth: formState.dateOfBirth ? format(formState.dateOfBirth, 'yyyy-MM-dd') : null,
    first_name: firstName,
    full_name: fullName.length ? fullName : null,
    gender: formState.gender,
    last_name: lastName,
    phone,
    phone_country_code: phone ? getCallingCodeByAlpha2(formState.phoneCountryIso) : null,
  };
};

export const toResidenceCountryState = (country: Country) => ({
  country: country.name,
  countryRegionCode: country.alpha3,
  countryRegionOfResidence: country.name,
});
