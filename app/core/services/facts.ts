import { API_BASE_URL } from '@/core/constants';
import { commonHeaders } from '@/core/constants/api';
import { TAuthData } from '@/core/types/auth';
import { TResponse } from '@/core/types/common';
import { TFactInitData } from '@/core/types/db';
import {
  TFactData,
  TFactItem,
  TFactsState,
  TFavorites,
} from '@/core/types/fact';

export const getFacts = async ({
  userId,
  category,
  token,
}: TAuthData & {
  category?: string | null;
}): Promise<
  | TResponse<{
      facts: TFactItem[];
      favorites: TFavorites;
    }>
  | undefined
> => {
  const searchParams = new URLSearchParams({
    category: category || 'all',
    userId,
  });
  const params = searchParams.toString();
  try {
    const response = await fetch(`${API_BASE_URL}/facts/?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...commonHeaders,
      },
    });
    if (!response.ok) {
      return { data: null, error: { message: 'Could not fetch facts.' } };
    }
    const result = await response.json();
    if (result?.data) {
      return { data: result.data, error: null };
    }
  } catch (err: any) {
    console.error(err);
    return { data: null, error: { message: err.message } };
  }
};

export const getDataToInitLocalDb = async ({
  userId,
  token,
}: TAuthData): Promise<TResponse<TFactInitData> | undefined> => {
  const searchParams = new URLSearchParams({ userId });
  const params = searchParams.toString();
  try {
    const response = await fetch(`${API_BASE_URL}/facts/init-db?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...commonHeaders,
      },
    });
    if (!response.ok) {
      return { data: null, error: { message: 'Could not fetch facts.' } };
    }
    const result = await response.json();
    if (result?.data) {
      return { data: result.data, error: null };
    }
  } catch (err: any) {
    console.error(err);
    return { data: null, error: { message: err.message } };
  }
};

export const getFactsForLocalDbStorage = async ({
  offset,
  userId,
  token,
}: TAuthData & {
  offset: number;
}): Promise<
  | TResponse<{
      facts: TFactItem[];
      done: boolean;
    }>
  | undefined
> => {
  const searchParams = new URLSearchParams({
    offset: `${offset}`,
    userId,
  });
  const params = searchParams.toString();
  try {
    const response = await fetch(`${API_BASE_URL}/facts/storage?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...commonHeaders,
      },
    });
    if (!response.ok) {
      return { data: null, error: { message: 'Could not fetch facts.' } };
    }
    const result = await response.json();
    if (result?.data) {
      return { data: result.data, error: null };
    }
  } catch (err: any) {
    console.error(err);
    return { data: null, error: { message: err.message } };
  }
};

export const postFact = async ({
  fact,
  token,
}: {
  fact: TFactData;
  token: string;
}): Promise<
  | TResponse<{
      factId: string;
    }>
  | undefined
> => {
  try {
    const response = await fetch(`${API_BASE_URL}/facts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        ...commonHeaders,
      },
      body: JSON.stringify({
        category: fact.category,
        title: fact.title,
      }),
    });
    if (!response.ok) {
      return { data: null, error: { message: 'Unable to add fact.' } };
    }
    const result = await response.json();
    if (result?.data) {
      return { data: result.data, error: null };
    }
  } catch (err: any) {
    console.error(err);
    return { data: null, error: { message: err.message } };
  }
};

export const postFactState = async ({
  factState,
  token,
  userId,
}: TAuthData & {
  factState: TFactsState;
}): Promise<
  | TResponse<{
      updatedAt: number;
    }>
  | undefined
> => {
  try {
    const response = await fetch(`${API_BASE_URL}/facts/state`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        ...commonHeaders,
      },
      body: JSON.stringify({
        factState,
        userId,
      }),
    });
    if (!response.ok) {
      return { data: null, error: { message: 'Unable to save fact state.' } };
    }
    const result = await response.json();
    if (result?.data) {
      return { data: result.data, error: null };
    }
  } catch (err: any) {
    console.error(err);
    return { data: null, error: { message: err.message } };
  }
};
