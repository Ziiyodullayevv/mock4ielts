'use client';

import { endpoints, axiosInstance } from '@/src/lib/axios';

type PaginationDto = {
  page?: number;
  pages?: number;
  size?: number;
  total?: number;
};

type FavoriteDto = {
  created_at?: string;
  createdAt?: string;
  id?: string;
  section_id?: string;
  sectionId?: string;
  question_id?: string;
  questionId?: string;
};

type FavoritesResponse = {
  data?: FavoriteDto[];
  message?: string;
  pagination?: PaginationDto;
  success?: boolean;
};

type FavoriteToggleDto = {
  added?: boolean;
  message?: string;
};

type FavoriteToggleResponse = {
  data?: FavoriteToggleDto;
  message?: string;
  success?: boolean;
};

type FavoriteStatusDto = {
  is_favorited?: boolean;
  isFavorited?: boolean;
};

type FavoriteStatusResponse = {
  data?: FavoriteStatusDto;
  message?: string;
  success?: boolean;
};

export type FavoriteItem = {
  createdAt: string;
  id: string;
  sectionId: string;
};

export type FavoritePagination = {
  page: number;
  pages: number;
  size: number;
  total: number;
};

export type FavoriteListResult = {
  items: FavoriteItem[];
  pagination: FavoritePagination;
};

export type FavoriteToggleResult = {
  added: boolean;
  message: string;
};

const DEFAULT_PAGINATION: FavoritePagination = {
  page: 1,
  pages: 1,
  size: 100,
  total: 0,
};

function normalizePagination(
  pagination?: PaginationDto | null,
  fallbackTotal = 0
): FavoritePagination {
  return {
    page: pagination?.page ?? DEFAULT_PAGINATION.page,
    pages: pagination?.pages ?? DEFAULT_PAGINATION.pages,
    size: pagination?.size ?? DEFAULT_PAGINATION.size,
    total: pagination?.total ?? fallbackTotal,
  };
}

export async function listFavorites(): Promise<FavoriteListResult> {
  const response = await axiosInstance.get<FavoritesResponse>(endpoints.favorites.list, {
    params: {
      page: 1,
      size: 100,
    },
  });

  const items = (response.data.data ?? [])
    .map((favorite) => {
      const sectionId =
        favorite.section_id ?? favorite.sectionId ?? favorite.question_id ?? favorite.questionId;

      if (!sectionId) {
        return null;
      }

      return {
        createdAt: favorite.created_at ?? favorite.createdAt ?? '',
        id: favorite.id ?? sectionId,
        sectionId,
      };
    })
    .filter((favorite): favorite is FavoriteItem => Boolean(favorite));

  return {
    items,
    pagination: normalizePagination(response.data.pagination, items.length),
  };
}

export async function toggleFavorite(sectionId: string): Promise<FavoriteToggleResult> {
  const response = await axiosInstance.post<FavoriteToggleResponse>(
    endpoints.favorites.toggle(sectionId)
  );

  return {
    added: Boolean(response.data.data?.added),
    message:
      response.data.data?.message ??
      response.data.message ??
      'Favorite status updated.',
  };
}

export async function getFavoriteStatus(sectionId: string): Promise<boolean> {
  const response = await axiosInstance.get<FavoriteStatusResponse>(
    endpoints.favorites.status(sectionId)
  );

  return Boolean(response.data.data?.is_favorited ?? response.data.data?.isFavorited);
}
