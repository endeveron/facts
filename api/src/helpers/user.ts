import { TAuthData, TUser } from '../types/user.js';

export const removeSensitiveData = (user: TUser): TAuthData => {
  const { password, ...safeAccountData } = user.account!;

  return {
    id: user._id.toString(),
    account: safeAccountData,
  };
};
