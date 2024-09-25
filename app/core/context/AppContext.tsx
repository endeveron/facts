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

import { consoleClors } from '@/core/constants/colors';
import { useToast } from '@/core/hooks/useToast';
const { red, reset } = consoleClors;

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
  const { showToast } = useToast();

  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authSession, setAuthSession] = useState<TAuthSession>(null);

  /** Updates auth state, adds auth data to SecureStore. */
  const saveAuthData = async ({ token, user }: TAuthData) => {
    setAuthSession({ token, user });
    const result = await saveAuthDataInSecureStore({ token, user });
    if (result.error) {
      showToast(result.error.message);
      return;
    }
  };

  /** Gets auth data from SecureStore, updates auth state. */
  const restoreAuthData = async () => {
    const result = await getAuthDataFromSecureStore();
    if (result.error) {
      showToast(result.error.message);
      return;
    }
    setAuthSession(result.data);
    router.push(SIGN_IN_SUCCESS_REDIRECT_URL);
  };

  // try to get auth data from SecureStore
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
    let error = false;

    // Dev start
    const factsStorageResult = await deleteFactsDataFromAsyncStorage();
    if (factsStorageResult.error) error = true;
    const result = await getResetFacts({
      token: authSession?.token as string,
      userId: authSession?.user.id as string,
    });
    if (!!result?.data) {
    }
    console.info(`${red}%s${reset}`, 'Facts data is reset in DB');
    // Dev end

    const authResult = await deleteAuthDataFromSecureStore();
    if (authResult.error) error = true;

    if (error) {
      showToast('Unable to clear data');
    } else {
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
