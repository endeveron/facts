import { API_BASE_URL } from '@/core/constants';
import { commonHeaders } from '@/core/constants/api';
import { TResponse } from '@/core/types/common';

export const postSchedule = async ({
  schedule,
  token,
  userId,
}: {
  schedule: string;
  token: string;
  userId: string;
}): Promise<
  TResponse<{
    success: boolean;
  }>
> => {
  const defaultErrmsg = 'Unable to post schedule';
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/schedule`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        ...commonHeaders,
      },
      body: JSON.stringify({
        schedule: schedule,
        userId: userId,
      }),
    });
    if (!response.ok) {
      return {
        data: null,
        error: { message: defaultErrmsg },
      };
    }

    const result = await response.json();
    if (result?.data) return { data: result.data, error: null };
    if (result?.error) return { data: null, error: result.error };
    return { data: null, error: { message: defaultErrmsg } };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: err.message || defaultErrmsg },
    };
  }
};
export const deleteSchedule = async ({
  schedule,
  token,
  userId,
}: {
  schedule: string;
  token: string;
  userId: string;
}): Promise<
  TResponse<{
    success: boolean;
  }>
> => {
  const defaultErrmsg = 'Unable to delete schedule';
  try {
    const response = await fetch(
      `${API_BASE_URL}/notifications/delete-schedule`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          ...commonHeaders,
        },
        body: JSON.stringify({
          schedule: schedule,
          userId: userId,
        }),
      }
    );
    if (!response.ok) {
      return {
        data: null,
        error: { message: defaultErrmsg },
      };
    }

    const result = await response.json();
    if (result?.data) return { data: result.data, error: null };
    if (result?.error) return { data: null, error: result.error };
    return { data: null, error: { message: defaultErrmsg } };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: err.message || defaultErrmsg },
    };
  }
};
