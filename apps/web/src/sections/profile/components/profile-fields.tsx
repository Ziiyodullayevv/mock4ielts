import type { ChangeEvent } from 'react';
import type { Country } from '@/src/components/ui/country-dropdown';
import type { Gender } from '@/src/sections/profile/types/profile-form';

import { Button } from '@/src/components/ui/button';
import { DatePacker } from '@/src/components/ui/date-packer';
import { PhoneInput } from '@/src/components/ui/phone-input';
import { CountryDropdown } from '@/src/components/ui/country-dropdown';
import {
  profileInputClassName,
  profileLabelClassName,
  profileDateDropdownClassName,
  profileDropdownCommandClassName,
  profileDropdownSurfaceClassName,
} from '@/src/sections/profile/constants/profile-form';

type FieldLabelProps = {
  children: React.ReactNode;
  required?: boolean;
};

export function ProfileFieldLabel({ children, required = false }: FieldLabelProps) {
  return (
    <label className={profileLabelClassName}>
      {children}
      {required ? <span className="ml-1.5 text-[#ff8585]">*</span> : null}
    </label>
  );
}

type ProfileTextFieldProps = {
  disabled?: boolean;
  label: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  value?: string;
};

export function ProfileTextField({
  disabled = false,
  label,
  onChange,
  required = false,
  value,
}: ProfileTextFieldProps) {
  return (
    <div>
      <ProfileFieldLabel required={required}>{label}</ProfileFieldLabel>
      <input
        disabled={disabled}
        value={value ?? ''}
        onChange={onChange}
        className={`${profileInputClassName} ${disabled ? 'cursor-not-allowed opacity-65' : ''}`}
      />
    </div>
  );
}

type ProfileDateFieldProps = {
  label: string;
  onChange: (value?: Date) => void;
  required?: boolean;
  value?: Date;
};

export function ProfileDateField({
  label,
  onChange,
  required = false,
  value,
}: ProfileDateFieldProps) {
  return (
    <div>
      <ProfileFieldLabel required={required}>{label}</ProfileFieldLabel>
      <DatePacker
        value={value}
        onChange={onChange}
        className="h-[52px] w-full justify-between rounded-xl border-stone-200 bg-white px-4 text-[15px] text-stone-900 shadow-none hover:bg-stone-50 hover:text-stone-900 dark:border-white/14 dark:bg-white/[0.03] dark:text-white/92 dark:hover:bg-white/[0.05] dark:hover:text-white"
        contentClassName={profileDateDropdownClassName}
      />
    </div>
  );
}

type ProfileCountryFieldProps = {
  label: string;
  onChange: (country: Country) => void;
  value: string;
};

export function ProfileCountryField({
  label,
  onChange,
  value,
}: ProfileCountryFieldProps) {
  return (
    <div>
      <ProfileFieldLabel>{label}</ProfileFieldLabel>
      <CountryDropdown
        defaultValue={value}
        onChange={onChange}
        placeholder="Select a country"
        className="h-[52px] rounded-xl border border-stone-200 bg-white px-4 text-[15px] text-stone-900 shadow-none hover:bg-stone-50 hover:text-stone-900 focus:ring-0 dark:border-white/14 dark:bg-white/[0.03] dark:text-white/92 dark:hover:text-white"
        contentClassName={`${profileDropdownSurfaceClassName} [&_[data-slot=command-list]]:max-h-[280px]`}
        commandClassName={profileDropdownCommandClassName}
      />
    </div>
  );
}

type ProfileGenderFieldProps = {
  onChange: (gender: Gender) => void;
  value: Gender;
};

export function ProfileGenderField({ onChange, value }: ProfileGenderFieldProps) {
  return (
    <div>
      <ProfileFieldLabel required>Gender</ProfileFieldLabel>
      <div className="flex h-[52px] items-center gap-6">
        <ProfileRadioOption
          active={value === 'male'}
          label="Male"
          onClick={() => onChange('male')}
        />
        <ProfileRadioOption
          active={value === 'female'}
          label="Female"
          onClick={() => onChange('female')}
        />
      </div>
    </div>
  );
}

type ProfileRadioOptionProps = {
  active: boolean;
  label: string;
  onClick: () => void;
};

function ProfileRadioOption({ active, label, onClick }: ProfileRadioOptionProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className="h-auto gap-3 px-0 text-stone-900 hover:bg-transparent hover:text-stone-900 dark:text-white dark:hover:text-white"
    >
      <span
        className={`grid size-[28px] place-items-center rounded-full border transition ${
          active ? 'border-[#ff9f2f]' : 'border-[#cbccd4]'
        }`}
      >
        <span
          className={`size-[11px] rounded-full ${active ? 'bg-[#ff9f2f]' : 'bg-transparent'}`}
        />
      </span>
      <span className="text-[15px] text-stone-900 dark:text-white">{label}</span>
    </Button>
  );
}

type ProfilePhoneFieldProps = {
  country: string;
  number: string;
  onChange: (value?: string) => void;
  onCountryChange: (countryCode: string) => void;
};

export function ProfilePhoneField({
  country,
  number,
  onChange,
  onCountryChange,
}: ProfilePhoneFieldProps) {
  return (
    <div>
      <ProfileFieldLabel>Your phone number</ProfileFieldLabel>
      <PhoneInput
        value={number}
        onChange={onChange}
        onCountryChange={(value) => {
          if (value) {
            onCountryChange(value);
          }
        }}
        defaultCountry={country as 'UZ'}
        international={false}
        countryButtonClassName="h-[52px] rounded-s-xl rounded-e-none border-stone-200 bg-white px-3 text-stone-900 shadow-none hover:bg-stone-50 hover:text-stone-900 dark:border-white/14 dark:bg-white/[0.03] dark:text-white/92 dark:hover:bg-white/[0.05] dark:hover:text-white"
        inputClassName="h-[52px] rounded-e-xl rounded-s-none border-stone-200 bg-white px-4 text-[15px] text-stone-900 shadow-none placeholder:text-stone-400 focus-visible:border-[#ff9f2f] focus-visible:bg-white dark:border-white/14 dark:bg-white/[0.03] dark:text-white/92 dark:placeholder:text-white/34 dark:focus-visible:bg-white/[0.05]"
        popoverContentClassName={profileDropdownSurfaceClassName}
        commandClassName={profileDropdownCommandClassName}
        className="w-full"
      />
    </div>
  );
}
