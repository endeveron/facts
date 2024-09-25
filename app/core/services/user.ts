import { API_BASE_URL } from '@/core/constants';
import { commonHeaders } from '@/core/constants/api';
import { TResponse } from '@/core/types/common';
import { TFactItem } from '@/core/types/fact';

// export const getUser = async ({ id, token }: { id: string; token: string }) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/users/${id}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         ...commonHeaders,
//       },
//     });
//     if (!response.ok) {
//       return { data: null, error: { message: 'Could not fetch user data.' } };
//     }
//     const result = await response.json();
//     if (result?.data) {
//       return { data: result.data, error: null };
//     }
//   } catch (err: any) {
//     console.error(err);
//     return { data: null, error: { message: err.message } };
//   }
// };

export const getFavorites = async ({
  userId,
  token,
}: {
  userId: string;
  token: string;
}): Promise<TResponse<{ favorites: TFactItem[] }> | undefined> => {
  if (!userId)
    return { data: null, error: { message: 'No user ID provided.' } };
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/favorites`, {
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
}: {
  factId: string;
  userId: string;
  category: string;
  token: string;
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
}: {
  userId: string;
  token: string;
}): Promise<TResponse<{ success: boolean }> | undefined> => {
  if (!userId)
    return { data: null, error: { message: 'No user ID provided.' } };
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/reset-facts`,
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
