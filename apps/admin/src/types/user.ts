export type IUser = {
  id: string;
  email: string;
  full_name: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  phone: string | null;
  phone_country_code?: string | null;
  country: string | null;
  country_region_of_residence?: string | null;
  country_region_code?: string | null;
  target_band: number | string | null;
  auth_provider: 'google' | 'apple' | 'email';
  token_balance: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type IUserFilters = {
  search: string;
  auth_provider: string;
};

export type IUsersPagination = {
  page: number;
  pages: number;
  size: number;
  total: number;
};

export type IUsersListResponse = {
  success: boolean;
  data: IUser[];
  message: string;
  pagination: IUsersPagination;
};

export type IUserDetailResponse = {
  success: boolean;
  data: IUser;
  message: string;
  pagination: null;
};
