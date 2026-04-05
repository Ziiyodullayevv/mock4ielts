import type { Country } from '@/src/components/ui/country-dropdown';
import type {
  Gender,
  ProfileFormState,
  ProfileInputChangeFactory,
} from '@/src/sections/profile/types/profile-form';

import { Button } from '@/src/components/ui/button';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { FileUploadSpecial1 } from '@/src/components/file-upload-special-1';
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
  onSaveProfile: () => void;
};

export function ProfileForm({
  avatarFallback,
  deleteDialogOpen,
  formState,
  hasProfile,
  isBusy,
  isDeletingAccount,
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
  onSaveProfile,
}: ProfileFormProps) {
  return (
    <>
      <main className={`${profilePageBackgroundClassName} pb-14 pt-24`}>
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="grid gap-8 px-1 py-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:px-4 lg:py-8">
            <aside className="flex flex-col items-center lg:items-start">
              <FileUploadSpecial1
                defaultImage={formState.avatar || undefined}
                disabled={isUploadingAvatar || isDeletingAccount}
                fallback={avatarFallback}
                onFileChange={onAvatarChange}
                className="items-center gap-5 lg:items-start"
                avatarClassName="size-[132px] border border-white/10 [&_[data-slot=avatar-fallback]]:text-[48px] [&_[data-slot=avatar-fallback]]:font-semibold"
                hintClassName="text-center text-[14px] text-white/42 lg:text-left"
                hintText={isUploadingAvatar ? 'Uploading avatar...' : 'Click to change avatar'}
                triggerClassName="rounded-full"
              />
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

          <div className="border-t border-white/10 px-1 py-7 lg:px-4">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="orange"
                disabled={isBusy || !hasProfile}
                className="h-12 min-w-[180px] rounded-full px-5 text-[15px] font-semibold sm:h-[52px] sm:min-w-[200px] sm:px-6 sm:text-[16px]"
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
