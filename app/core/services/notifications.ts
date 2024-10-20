import { API_BASE_URL } from '@/core/constants';
import { commonHeaders } from '@/core/constants/api';
import { TAuthData } from '@/core/types/auth';
import { TResponse } from '@/core/types/common';
import { TNotificationSubscription } from '@/core/types/notification';

export const getSubscription = async ({
  token,
  userId,
}: TAuthData): Promise<TResponse<TNotificationSubscription>> => {
  const defaultErrmsg = 'Unable to get subscription data';
  const searchParams = new URLSearchParams({ userId });
  const params = searchParams.toString();
  try {
    const response = await fetch(
      `${API_BASE_URL}/notifications/subscription?${params}`,
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
        error: { message: defaultErrmsg },
      };
    }

    const result = await response.json();
    if (result?.error) return { data: null, error: result.error };
    if (result?.data || result?.data === null) {
      return { data: result.data, error: null };
    }
    return { data: null, error: { message: defaultErrmsg } };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: err.message || defaultErrmsg },
    };
  }
};

export const postSubscription = async ({
  subscription,
  token,
  userId,
}: TAuthData & {
  subscription: TNotificationSubscription;
}): Promise<
  TResponse<{
    success: boolean;
  }>
> => {
  const defaultErrmsg = 'Unable to save subscription';
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/subscription`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        ...commonHeaders,
      },
      body: JSON.stringify({
        subscription,
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

export const patchSubscription = async ({
  subscription,
  token,
  userId,
}: TAuthData & {
  subscription: TNotificationSubscription;
}): Promise<
  TResponse<{
    success: boolean;
  }>
> => {
  const defaultErrmsg = 'Unable to update subscription';
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/subscription`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        ...commonHeaders,
      },
      body: JSON.stringify({
        subscription,
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

export const postSchedule = async ({
  schedule,
  token,
  userId,
}: TAuthData & {
  schedule: string;
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
}: TAuthData & {
  schedule: string;
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
