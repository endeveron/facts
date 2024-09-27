import { TAuthData, TUser } from '../types/user.js';

export const configureUserData = (user: TUser): TAuthData => {
  const { password, ...safeAccountData } = user.account!;

  return {
    id: user._id.toString(),
    account: safeAccountData,
  };
};
