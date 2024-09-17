import { API_BASE_URL } from '@/core/constants';
import { commonHeaders } from '@/core/constants/api';
import { TServiceResponse } from '@/core/types/common';
import { TFactData, TFactItem, TFavouriteArr } from '@/core/types/facts';

export const getFacts = async ({
  userId,
  token,
}: {
  userId: string;
  token: string;
}): Promise<
  | TServiceResponse<{
      facts: TFactItem[];
      liked: TFavouriteArr;
    }>
  | undefined
> => {
  try {
    const response = await fetch(`${API_BASE_URL}/facts/${userId}`, {
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
  | TServiceResponse<{
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

export const resetStatistics = async ({
  userId,
  token,
}: {
  userId: string;
  token: string;
}): Promise<TServiceResponse<{}> | undefined> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/facts/reset-statistics/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...commonHeaders,
        },
      }
    );
    if (!response.ok) {
      return { data: null, error: { message: 'Could not reset statistics.' } };
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
