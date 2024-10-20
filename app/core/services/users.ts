import { API_BASE_URL } from '@/core/constants';
import { commonHeaders } from '@/core/constants/api';
import { TAuthData } from '@/core/types/auth';
import { TResponse, TStatus } from '@/core/types/common';
import { TFactItem } from '@/core/types/fact';

export const getFavorites = async ({
  userId,
  token,
}: TAuthData): Promise<TResponse<{ favorites: TFactItem[] }> | undefined> => {
  if (!userId) {
    return { data: null, error: { message: 'No user ID provided.' } };
  }
  const searchParams = new URLSearchParams({ userId });
  const params = searchParams.toString();
  try {
    const response = await fetch(`${API_BASE_URL}/users/favorites?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...commonHeaders,
      },
    });
    if (!response.ok) {
      return {
        data: null,
        error: { message: 'Unable to retrieve the facts user favorites.' },
      };
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

export const postEvaluateFact = async ({
  factId,
  userId,
  category,
  token,
}: TAuthData & {
  factId: string;
  category: string;
}): Promise<TResponse<{ status: 'like' | 'dislike' }> | undefined> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/evaluate-fact`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        ...commonHeaders,
      },
      body: JSON.stringify({
        factId,
        userId,
        category,
      }),
    });
    if (!response.ok) {
      return { data: null, error: { message: 'Unable to evaluate fact.' } };
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

export const getResetFacts = async ({
  userId,
  token,
}: TAuthData): Promise<TResponse<TStatus> | undefined> => {
  if (!userId) {
    return { data: null, error: { message: 'No user ID provided.' } };
  }
  const searchParams = new URLSearchParams({ userId });
  const params = searchParams.toString();
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/reset-facts?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...commonHeaders,
        },
      }
    );
    if (!response.ok) {
      return {
        data: null,
        error: { message: 'Unable to reset facts.' },
      };
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
