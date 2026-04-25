'use client';

import type { ChangeEvent } from 'react';
import type { Country } from '@/src/components/ui/country-dropdown';
import type { Gender, ProfileFormState } from '@/src/sections/profile/types/profile-form';

import { paths } from '@/src/routes/paths';
import { useState, useEffect } from 'react';
import { useRouter } from '@/src/routes/hooks';
import { clearAuthTokens } from '@/src/lib/axios';
import { toast } from '@/src/components/ui/sonner';
import { buildLoginHref } from '@/src/auth/utils/return-to';
import { useAuthSession } from '@/src/auth/hooks/use-auth-session';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMyProfileQuery } from '@/src/auth/hooks/use-my-profile-query';
import { EMPTY_FORM_STATE } from '@/src/sections/profile/constants/profile-form';
import {
  type UserProfile,
  deleteMyAccount,
  removeMyAvatar,
  updateMyProfile,
  updateMyAvatar,
} from '@/src/auth/api/profile-api';
import {
  toFormState,
  buildUpdatePayload,
  toResidenceCountryState,
  getProfileAvatarFallback,
} from '@/src/sections/profile/utils/profile-form';

export function useProfileViewModel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isHydrated } = useAuthSession();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draftState, setDraftState] = useState<ProfileFormState | null>(null);
  const {
    data: profile,
    error,
    isLoading,
    refetch,
  } = useMyProfileQuery(isAuthenticated);
  const profileFormState = profile ? toFormState(profile) : EMPTY_FORM_STATE;
  const formState = draftState ?? profileFormState;

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(buildLoginHref(paths.profile.root));
    }
  }, [isAuthenticated, isHydrated, router]);

  const patchFormState = (updater: (current: ProfileFormState) => ProfileFormState) => {
    setDraftState((current) => updater(current ?? profileFormState));
  };

  const updateProfileMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['auth', 'me'], updatedProfile);
      setDraftState(toFormState(updatedProfile));
      toast.success('Your profile has been updated.');
    },
    onError: (mutationError) => {
      toast.error(
        mutationError instanceof Error ? mutationError.message : 'Failed to save changes.'
      );
    },
  });

  const patchProfileAvatar = (avatar: string | null) => {
    queryClient.setQueryData<UserProfile | undefined>(['auth', 'me'], (currentProfile) =>
      currentProfile
        ? {
            ...currentProfile,
            avatar,
          }
        : currentProfile
    );

    setDraftState((current) => ({
      ...(current ?? profileFormState),
      avatar: avatar ?? '',
    }));
  };

  const uploadAvatarMutation = useMutation({
    mutationFn: updateMyAvatar,
    onSuccess: (avatarUrl) => {
      patchProfileAvatar(avatarUrl);
      toast.success('Avatar updated.');
    },
    onError: (mutationError) => {
      toast.error(
        mutationError instanceof Error ? mutationError.message : 'Avatar upload failed.'
      );
    },
  });

  const removeAvatarMutation = useMutation({
    mutationFn: removeMyAvatar,
    onSuccess: () => {
      patchProfileAvatar(null);
      toast.success('Avatar removed.');
    },
    onError: (mutationError) => {
      toast.error(
        mutationError instanceof Error ? mutationError.message : 'Failed to remove avatar.'
      );
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: () => {
      clearAuthTokens();
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
      router.replace('/');
    },
    onError: (mutationError) => {
      setDeleteDialogOpen(false);
      toast.error(
        mutationError instanceof Error ? mutationError.message : 'Failed to delete account.'
      );
    },
  });

  const handleInputChange =
    <K extends keyof ProfileFormState>(field: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      patchFormState((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleAvatarChange = (file: File | null) => {
    if (!file) {
      return;
    }

    uploadAvatarMutation.mutate(file);
  };

  const handleRemoveAvatar = () => {
    removeAvatarMutation.mutate();
  };

  const handleDateOfBirthChange = (nextDate?: Date) => {
    patchFormState((current) => ({
      ...current,
      dateOfBirth: nextDate,
    }));
  };

  const handleGenderChange = (gender: Gender) => {
    patchFormState((current) => ({
      ...current,
      gender,
    }));
  };

  const handleCountryChange = (country: Country) => {
    patchFormState((current) => ({
      ...current,
      ...toResidenceCountryState(country),
    }));
  };

  const handlePhoneChange = (value?: string) => {
    patchFormState((current) => ({
      ...current,
      phone: value ?? '',
    }));
  };

  const handlePhoneCountryChange = (countryCode: string) => {
    patchFormState((current) => ({
      ...current,
      phoneCountryIso: countryCode,
    }));
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(buildUpdatePayload(formState));
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  return {
    avatarFallback: getProfileAvatarFallback(formState),
    deleteDialogOpen,
    error,
    formState,
    hasProfile: Boolean(profile),
    isAuthenticated,
    isHydrated,
    isBusy:
      updateProfileMutation.isPending ||
      uploadAvatarMutation.isPending ||
      removeAvatarMutation.isPending ||
      deleteAccountMutation.isPending,
    isDeletingAccount: deleteAccountMutation.isPending,
    isLoading,
    isRemovingAvatar: removeAvatarMutation.isPending,
    isSavingProfile: updateProfileMutation.isPending,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    refetch,
    setDeleteDialogOpen,
    handleAvatarChange,
    handleCountryChange,
    handleDateOfBirthChange,
    handleDeleteAccount,
    handleGenderChange,
    handleInputChange,
    handlePhoneChange,
    handlePhoneCountryChange,
    handleRemoveAvatar,
    handleSaveProfile,
  };
}
