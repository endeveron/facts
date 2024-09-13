import { API_BASE_URL } from '@/core/constants';
import { commonHeaders } from '@/core/constants/api';
import { TServiceResponse } from '@/core/types/common';

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

export const postEvaluateFact = async ({
  factId,
  userId,
  token,
}: {
  factId: string;
  userId: string;
  token: string;
}): Promise<TServiceResponse<{ status: 'liked' | 'disliked' }> | undefined> => {
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
