export type TAuthCredentials = {
  email: string;
  password: string;
  name?: string;
};

export type TAuthMethodResult = { error: string | null };

export type TUser = {
  id: string;
  account: {
    name: string;
    email: string;
    role: {
      index: number;
      name: string;
    };
  };
};

export type TUserAuthData = {
  token: string;
  user: TUser;
};

export type TStoreAuthData = TUserAuthData & {
  timestamp: number;
};

export type TAuthData = {
  token: string;
  userId: string;
};

export type TAuthSession = TUserAuthData | null;

export type TSessionContext = {
  session: TAuthSession;
  isLoading: boolean;
  signUp: (args: TAuthCredentials) => Promise<boolean | undefined>;
  signIn: (args: TAuthCredentials) => Promise<boolean | undefined>;
  signOut: () => Promise<any>;
};
