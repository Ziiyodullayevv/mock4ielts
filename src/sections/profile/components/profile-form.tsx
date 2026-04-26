import type { Country } from '@/src/components/ui/country-dropdown';
import type {
  Gender,
  ProfileFormState,
  ProfileInputChangeFactory,
} from '@/src/sections/profile/types/profile-form';

import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import { Trash2, CheckCircle2, LoaderCircle } from 'lucide-react';
import { FileUploadSpecial1 } from '@/src/components/file-upload-special-1';
import { PRACTICE_FOOTER_ACTIVE_BUTTON_CLASS } from '@/src/layouts/practice-footer-theme';
import { profilePageBackgroundClassName } from '@/src/sections/profile/constants/profile-form';

import { ProfileDeleteDialog } from './profile-delete-dialog';
import {
  ProfileTextField,
  ProfileDateField,
  ProfilePhoneField,
  ProfileGenderField,
  ProfileCountryField,
} from './profile-fields';

type ProfileFormProps = {
  avatarFallback: string;
  deleteDialogOpen: boolean;
  formState: ProfileFormState;
  hasProfile: boolean;
  isBusy: boolean;
  isDeletingAccount: boolean;
  isRemovingAvatar: boolean;
  isSavingProfile: boolean;
  isUploadingAvatar: boolean;
  onAvatarChange: (file: File | null) => void;
  onCountryChange: (country: Country) => void;
  onDateOfBirthChange: (value?: Date) => void;
  onDeleteAccount: () => void;
  onDeleteDialogChange: (open: boolean) => void;
  onGenderChange: (gender: Gender) => void;
  onInputChange: ProfileInputChangeFactory;
  onOpenDeleteDialog: () => void;
  onPhoneChange: (value?: string) => void;
  onPhoneCountryChange: (countryCode: string) => void;
  onRemoveAvatar: () => void;
  onSaveProfile: () => void;
};

export function ProfileForm({
  avatarFallback,
  deleteDialogOpen,
  formState,
  hasProfile,
  isBusy,
  isDeletingAccount,
  isRemovingAvatar,
  isSavingProfile,
  isUploadingAvatar,
  onAvatarChange,
  onCountryChange,
  onDateOfBirthChange,
  onDeleteAccount,
  onDeleteDialogChange,
  onGenderChange,
  onInputChange,
  onOpenDeleteDialog,
  onPhoneChange,
  onPhoneCountryChange,
  onRemoveAvatar,
  onSaveProfile,
}: ProfileFormProps) {
  const avatarActionDisabled = isUploadingAvatar || isRemovingAvatar || isDeletingAccount;

  return (
    <>
      <main className={`${profilePageBackgroundClassName} pb-14 pt-24`}>
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="grid gap-8 px-1 py-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:px-4 lg:py-8">
            <aside className="flex flex-col items-center lg:items-start">
              <FileUploadSpecial1
                defaultImage={formState.avatar || undefined}
                disabled={avatarActionDisabled}
                fallback={avatarFallback}
                maxSize={10 * 1024 * 1024}
                onFileChange={onAvatarChange}
                className="items-center gap-5 lg:items-start"
                avatarClassName="size-[132px] border border-stone-200 bg-[#f2f2f2] shadow-[0_14px_28px_rgba(15,23,42,0.08)] [&_[data-slot=avatar-fallback]]:bg-[#f2f2f2] [&_[data-slot=avatar-fallback]]:text-[48px] [&_[data-slot=avatar-fallback]]:font-semibold [&_[data-slot=avatar-fallback]]:text-stone-500 dark:border-white/10 dark:bg-transparent dark:shadow-none dark:[&_[data-slot=avatar-fallback]]:bg-white/5 dark:[&_[data-slot=avatar-fallback]]:text-white"
                hintClassName="text-center text-[14px] text-stone-500 lg:text-left dark:text-white/42"
                hintText={
                  isUploadingAvatar
                    ? 'Uploading avatar...'
                    : isRemovingAvatar
                      ? 'Removing avatar...'
                      : 'Click to change avatar'
                }
                triggerClassName="rounded-full"
              />

              {formState.avatar ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={avatarActionDisabled}
                  onClick={onRemoveAvatar}
                  className="mt-3 h-9 rounded-full px-3 text-[13px] font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-60 dark:text-white/55 dark:hover:bg-white/8 dark:hover:text-white"
                >
                  {isRemovingAvatar ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" strokeWidth={1.9} />
                  )}
                  {isRemovingAvatar ? 'Removing...' : 'Remove avatar'}
                </Button>
              ) : null}
            </aside>

            <section className="grid gap-x-7 gap-y-7 md:grid-cols-2">
              <ProfileTextField
                label="First name"
                required
                value={formState.firstName}
                onChange={onInputChange('firstName')}
              />

              <ProfileTextField
                label="Last name"
                required
                value={formState.lastName}
                onChange={onInputChange('lastName')}
              />

              <ProfileDateField
                label="Date of birth"
                required
                value={formState.dateOfBirth}
                onChange={onDateOfBirthChange}
              />

              <ProfileGenderField value={formState.gender} onChange={onGenderChange} />

              <ProfileTextField
                label="Email"
                value={formState.email}
                onChange={onInputChange('email')}
                disabled
              />

              <ProfilePhoneField
                country={formState.phoneCountryIso}
                number={formState.phone}
                onChange={onPhoneChange}
                onCountryChange={onPhoneCountryChange}
              />

              <ProfileCountryField
                label="Country/Region of residence"
                value={formState.countryRegionCode}
                onChange={onCountryChange}
              />

              <div className="md:col-span-2">
                <Button
                  type="button"
                  variant="link"
                  disabled={isDeletingAccount}
                  className="h-auto px-0 text-[14px] font-medium text-[#ff8a9e] underline underline-offset-4 hover:text-[#ffa0b0]"
                  onClick={onOpenDeleteDialog}
                >
                  {isDeletingAccount ? 'Deleting account...' : 'Delete Account'}
                </Button>
              </div>
            </section>
          </div>

          <div className="border-t border-stone-200 px-1 py-7 lg:px-4 dark:border-white/10">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="black"
                disabled={isBusy || !hasProfile}
                className={cn(
                  'h-11 min-w-[164px] rounded-full border px-4 text-[15px] font-semibold shadow-[0_12px_28px_rgba(255,120,75,0.24)] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-none disabled:bg-stone-300 disabled:text-white/80 disabled:shadow-none dark:disabled:border-white/20 dark:disabled:bg-white/20 dark:disabled:text-white/50',
                  PRACTICE_FOOTER_ACTIVE_BUTTON_CLASS
                )}
                onClick={onSaveProfile}
              >
                {isSavingProfile ? (
                  <LoaderCircle className="size-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-5" strokeWidth={1.9} />
                )}
                {isSavingProfile ? 'Saving changes...' : 'Save changes'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <ProfileDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={onDeleteDialogChange}
        onConfirm={onDeleteAccount}
        isPending={isDeletingAccount}
      />
    </>
  );
}
