import type { ChangeEvent } from 'react';

export type Gender = 'female' | 'male';

export type ProfileFormState = {
  avatar: string;
  country: string;
  countryRegionCode: string;
  countryRegionOfResidence: string;
  dateOfBirth?: Date;
  email: string;
  firstName: string;
  gender: Gender;
  lastName: string;
  phone: string;
  phoneCountryIso: string;
};

export type ProfileInputChangeFactory = <K extends keyof ProfileFormState>(
  field: K
) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
