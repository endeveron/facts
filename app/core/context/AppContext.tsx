import { router } from 'expo-router';

import {
  SIGN_IN_SUCCESS_REDIRECT_URL,
  SIGN_OUT_REDIRECT_URL,
} from '@/core/constants';
import { showAlert } from '@/core/helpers/alert';
import {
  TAuthContext,
  TAuthCredentials,
  TAuthData,
  TAuthSession,
} from '@/core/types/auth';

import {
  deleteAuthDataFromSecureStore,
  deleteFactsDataFromAsyncStorage,
  getAuthDataFromSecureStore,
  saveAuthDataInSecureStore,
} from '@/core/helpers/store';
import { postSignIn, postSignUp } from '@/core/services/auth';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { getResetFacts } from '@/core/services/user';

type TAppContextProps = {
  auth: TAuthContext;
};

const AppContext = createContext<TAppContextProps>({
  auth: {
    session: null,
    isLoading: false,
    signUp: async (args: TAuthCredentials) => false,
    signIn: async (args: TAuthCredentials) => false,
    signOut: async () => {},
  },
});

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }: PropsWithChildren) => {
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authSession, setAuthSession] = useState<TAuthSession>(null);

  /** Updates auth state, adds auth data to SecureStore. */
  const saveAuthData = async ({ token, user }: TAuthData) => {
    setAuthSession({ token, user });
    await saveAuthDataInSecureStore({ token, user });
  };

  /** Gets auth data from SecureStore, updates auth state. */
  const restoreAuthData = async () => {
    const authData = await getAuthDataFromSecureStore();
    if (authData) {
      setAuthSession(authData);
      router.push(SIGN_IN_SUCCESS_REDIRECT_URL);
    }
  };

  // Try to restore auth data from SecureStore
  useEffect(() => {
    restoreAuthData();
  }, []);

  const signUp = async ({
    name,
    email,
    password,
  }: TAuthCredentials): Promise<boolean | undefined> => {
    setIsAuthLoading(true);
    const result = await postSignUp({ name, email, password });
    setIsAuthLoading(false);
    if (result?.error) {
      showAlert(result.error.message);
      return false;
    }
    if (result?.data) {
      await saveAuthData(result.data);
      return true;
    }
  };

  const signIn = async ({
    email,
    password,
  }: TAuthCredentials): Promise<boolean | undefined> => {
    setIsAuthLoading(true);
    const result = await postSignIn({ email, password });
    setIsAuthLoading(false);
    if (result?.error) {
      showAlert(result.error.message);
      return false;
    }
    if (result?.data) {
      await saveAuthData(result.data);
      return true;
    }
  };

  const signOut = async () => {
    // Dev start
    await deleteFactsDataFromAsyncStorage();
    const result = await getResetFacts({
      token: authSession?.token as string,
      userId: authSession?.user.id as string,
    });
    if (!!result?.data) console.info('Fact offset is reset in DB.');
    // Dev end

    const isAuthDataResetSuccess = await deleteAuthDataFromSecureStore();
    if (isAuthDataResetSuccess) {
      setAuthSession(null);
      router.replace(SIGN_OUT_REDIRECT_URL);
    }
  };

  const value = {
    auth: {
      signUp,
      signIn,
      signOut,
      session: authSession,
      isLoading: isAuthLoading,
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
