import { TResponse } from '@/core/types/common';

export const handleServiceResult = <T>({
  result,
  errorMsg,
}: {
  result: TResponse<T> | undefined;
  errorMsg?: string;
}): TResponse<T> => {
  if (!result) {
    console.error('handleServiceResult result:', result);
    return {
      data: null,
      error: { message: errorMsg ?? 'Something went wrong' },
    };
  }
  if (result.error) {
    return {
      data: null,
      error: { message: result.error.message ?? errorMsg },
    };
  }
  return {
    data: result.data,
    error: null,
  };
};
