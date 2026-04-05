import { CONFIG } from '@/src/global-config';
import { endpoints, axiosInstance } from '@/src/lib/axios';

type ApiRecord = Record<string, unknown>;

export type UserProfile = {
  authProvider?: string | null;
  avatar?: string | null;
  country?: string | null;
  countryRegionCode?: string | null;
  countryRegionOfResidence?: string | null;
  createdAt?: string | null;
  dateOfBirth?: string | null;
  email: string;
  firstName?: string | null;
  fullName?: string | null;
  gender?: string | null;
  id: string;
  lastName?: string | null;
  phone?: string | null;
  phoneCountryCode?: string | null;
  targetBand?: string | null;
  tokenBalance: number;
  updatedAt?: string | null;
};

export type UserProfileUpdateInput = {
  avatar?: string | null;
  country?: string | null;
  country_region_code?: string | null;
  country_region_of_residence?: string | null;
  date_of_birth?: string | null;
  first_name?: string | null;
  full_name?: string | null;
  gender?: string | null;
  last_name?: string | null;
  phone?: string | null;
  phone_country_code?: string | null;
  target_band?: number | string | null;
};

type MediaUploadResponse = {
  contentType?: string | null;
  createdAt?: string | null;
  filename?: string | null;
  id: string;
  size: number;
  url: string;
};

const asRecord = (value: unknown): ApiRecord | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as ApiRecord) : null;

const pickNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

const pickString = (value: unknown) => (typeof value === 'string' ? value : undefined);

const pickNullableString = (value: unknown) => {
  if (value === null) {
    return null;
  }

  return pickString(value);
};

const extractProfileData = (payload: unknown) => {
  const root = asRecord(payload);

  return asRecord(root?.data) ?? {};
};

const normalizeMediaUrl = (value: unknown) => {
  const rawValue = pickNullableString(value);

  if (!rawValue) {
    return rawValue;
  }

  if (/^(https?:|data:|blob:)/i.test(rawValue)) {
    return rawValue;
  }

  const serverUrl = CONFIG.serverUrl.trim();

  if (!serverUrl) {
    return rawValue;
  }

  try {
    const serverOrigin = new URL(serverUrl).origin;
    const normalizedPath = rawValue.startsWith('/') ? rawValue : `/${rawValue}`;

    return new URL(normalizedPath, serverOrigin).toString();
  } catch {
    return rawValue;
  }
};

const normalizeUserProfile = (payload: unknown): UserProfile => {
  const data = extractProfileData(payload);

  return {
    authProvider: pickNullableString(data.auth_provider),
    avatar: normalizeMediaUrl(data.avatar),
    country: pickNullableString(data.country),
    countryRegionCode: pickNullableString(data.country_region_code),
    countryRegionOfResidence: pickNullableString(data.country_region_of_residence),
    createdAt: pickNullableString(data.created_at),
    dateOfBirth: pickNullableString(data.date_of_birth),
    email: pickString(data.email) ?? '',
    firstName: pickNullableString(data.first_name),
    fullName: pickNullableString(data.full_name),
    gender: pickNullableString(data.gender),
    id: pickString(data.id) ?? '',
    lastName: pickNullableString(data.last_name),
    phone: pickNullableString(data.phone),
    phoneCountryCode: pickNullableString(data.phone_country_code),
    targetBand: pickNullableString(data.target_band),
    tokenBalance: pickNumber(data.token_balance),
    updatedAt: pickNullableString(data.updated_at),
  };
};

export async function getMyProfile(): Promise<UserProfile> {
  const response = await axiosInstance.get(endpoints.profile.me);

  return normalizeUserProfile(response.data);
}

export async function updateMyProfile(payload: UserProfileUpdateInput): Promise<UserProfile> {
  const response = await axiosInstance.patch(endpoints.profile.update, payload);

  return normalizeUserProfile(response.data);
}

export async function deleteMyAccount(): Promise<void> {
  await axiosInstance.delete(endpoints.profile.delete);
}

export async function uploadProfileAvatar(file: File): Promise<MediaUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post(endpoints.admin.media.upload, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const data = extractProfileData(response.data);
  const id = pickString(data.id);
  const url = normalizeMediaUrl(data.url);

  if (!id || !url) {
    throw new Error('Upload response did not include a media url.');
  }

  return {
    contentType: pickNullableString(data.content_type),
    createdAt: pickNullableString(data.created_at),
    filename: pickNullableString(data.filename),
    id,
    size: pickNumber(data.size),
    url,
  };
}
