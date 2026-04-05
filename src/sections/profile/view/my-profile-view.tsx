'use client';

import { ProfileForm } from '@/src/sections/profile/components/profile-form';
import { ProfileState } from '@/src/sections/profile/components/profile-state';
import { useProfileViewModel } from '@/src/sections/profile/hooks/use-profile-view-model';

export function MyProfileView() {
  const profile = useProfileViewModel();

  if (!profile.isAuthenticated) {
    return <ProfileState label="Redirecting to login..." />;
  }

  if (profile.isLoading && !profile.hasProfile) {
    return <ProfileState label="Loading your profile..." />;
  }

  if (profile.error instanceof Error && !profile.hasProfile) {
    return (
      <ProfileState
        description={profile.error.message}
        label="We couldn't load your profile."
        actionLabel="Try again"
        onAction={() => void profile.refetch()}
      />
    );
  }

  return (
    <ProfileForm
      avatarFallback={profile.avatarFallback}
      deleteDialogOpen={profile.deleteDialogOpen}
      formState={profile.formState}
      hasProfile={profile.hasProfile}
      isBusy={profile.isBusy}
      isDeletingAccount={profile.isDeletingAccount}
      isSavingProfile={profile.isSavingProfile}
      isUploadingAvatar={profile.isUploadingAvatar}
      onAvatarChange={profile.handleAvatarChange}
      onCountryChange={profile.handleCountryChange}
      onDateOfBirthChange={profile.handleDateOfBirthChange}
      onDeleteAccount={profile.handleDeleteAccount}
      onDeleteDialogChange={profile.setDeleteDialogOpen}
      onGenderChange={profile.handleGenderChange}
      onInputChange={profile.handleInputChange}
      onOpenDeleteDialog={() => profile.setDeleteDialogOpen(true)}
      onPhoneChange={profile.handlePhoneChange}
      onPhoneCountryChange={profile.handlePhoneCountryChange}
      onSaveProfile={profile.handleSaveProfile}
    />
  );
}
