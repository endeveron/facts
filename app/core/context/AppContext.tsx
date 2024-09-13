import { router } from 'expo-router';

import { SIGN_OUT_REDIRECT_URL } from '@/core/constants';
import { showAlert } from '@/core/helpers/alert';
import {
  TAuthContext,
  TAuthCredentials,
  TAuthData,
  TAuthSession,
} from '@/core/types/auth';
import { TCurrentItem } from '@/core/types/facts';

import {
  deleteAuthDataFromSecureStore,
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

type TAppContextProps = {
  auth: TAuthContext;
  // facts: TFactsContext;
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

  const [currentItem, setCurrentItem] = useState<TCurrentItem | null>(null);
  const [totalItems, setTotalItems] = useState<number | null>(null);
  const [notShownItemsNumber, setNotShownItemsNumber] = useState<number | null>(
    null
  );

  // Auth section

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
      router.push('/home');
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
    const success = await deleteAuthDataFromSecureStore();
    if (success) {
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
