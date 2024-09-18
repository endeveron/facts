import { showAlert } from '@/core/helpers/alert';
import { TcountNotShownFactsArgs } from '@/core/types/fact';

export const updateNotShownNum = ({
  factsLength,
  current,
  notShownNum,
  isRefetch,
}: TcountNotShownFactsArgs) => {
  if (factsLength === null || current === null) {
    showAlert('updateNotShownNum: Invalid input data.');
    return null;
  }

  // First time fetch
  if (notShownNum === null) return factsLength - 1;

  const newNotShownNum = factsLength - current.index - 1;

  // Refetch
  if (isRefetch) return newNotShownNum;
  // Update only if the new value is less than the current one

  // Scroll
  if (notShownNum > newNotShownNum) return newNotShownNum;
  return notShownNum;
};
