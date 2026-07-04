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
  removeMyAvatar,
  updateMyAvatar,
  deleteMyAccount,
  updateMyProfile,
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
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingAvatarPreviewUrl, setPendingAvatarPreviewUrl] = useState<string | null>(null);
  const [isAvatarRemovalPending, setIsAvatarRemovalPending] = useState(false);
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

  useEffect(
    () => () => {
      if (pendingAvatarPreviewUrl) {
        URL.revokeObjectURL(pendingAvatarPreviewUrl);
      }
    },
    [pendingAvatarPreviewUrl]
  );

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      let avatar: string | null | undefined;

      if (isAvatarRemovalPending) {
        await removeMyAvatar();
        avatar = null;
      }

      if (pendingAvatarFile) {
        avatar = await updateMyAvatar(pendingAvatarFile);
      }

      const updatedProfile = await updateMyProfile(buildUpdatePayload(formState));

      return {
        ...updatedProfile,
        avatar: avatar !== undefined ? avatar : updatedProfile.avatar,
      };
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['auth', 'me'], updatedProfile);
      setDraftState(toFormState(updatedProfile));
      setPendingAvatarFile(null);
      setPendingAvatarPreviewUrl(null);
      setIsAvatarRemovalPending(false);
      toast.success('Your profile has been updated.');
    },
    onError: (mutationError) => {
      toast.error(
        mutationError instanceof Error ? mutationError.message : 'Failed to save changes.'
      );
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: () => {
      clearAuthTokens();
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
      queryClient.removeQueries({ queryKey: ['statistics'] });
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
      setPendingAvatarFile(null);
      setPendingAvatarPreviewUrl(null);
      setIsAvatarRemovalPending(false);
      patchFormState((current) => ({
        ...current,
        avatar: profileFormState.avatar,
      }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setPendingAvatarFile(file);
    setPendingAvatarPreviewUrl(previewUrl);
    setIsAvatarRemovalPending(false);
    patchFormState((current) => ({
      ...current,
      avatar: previewUrl,
    }));
  };

  const handleRemoveAvatar = () => {
    setPendingAvatarFile(null);
    setPendingAvatarPreviewUrl(null);
    setIsAvatarRemovalPending(Boolean(profileFormState.avatar));
    patchFormState((current) => ({
      ...current,
      avatar: '',
    }));
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
    saveProfileMutation.mutate();
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
      saveProfileMutation.isPending || deleteAccountMutation.isPending,
    isDeletingAccount: deleteAccountMutation.isPending,
    isLoading,
    isRemovingAvatar: saveProfileMutation.isPending && isAvatarRemovalPending,
    isSavingProfile: saveProfileMutation.isPending,
    isUploadingAvatar: saveProfileMutation.isPending && Boolean(pendingAvatarFile),
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
