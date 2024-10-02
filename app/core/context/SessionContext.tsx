import { router } from 'expo-router';

import { DEFAULT_REDIRECT_URL } from '@/core/constants';
import {
  TSessionContext,
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
import { getResetFacts } from '@/core/services/user';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

import { consoleClors } from '@/core/constants/colors';
import { useToast } from '@/core/hooks/useToast';
const { red, reset } = consoleClors;

const SessionContext = createContext<TSessionContext>({
  session: null,
  isLoading: false,
  signUp: async (args: TAuthCredentials) => false,
  signIn: async (args: TAuthCredentials) => false,
  signOut: async () => {},
});

export const useSession = () => {
  const value = useContext(SessionContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }
  return value;
};

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<TAuthSession>(null);
  // console.log('session.token', session?.token);

  /** Updates auth state, adds auth data to SecureStore. */
  const saveAuthData = async ({ token, user }: TAuthData) => {
    setSession({ token, user });
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
    setSession(result.data);
    router.push(DEFAULT_REDIRECT_URL);
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
    setIsLoading(true);
    const result = await postSignUp({ name, email, password });
    setIsLoading(false);
    if (result?.error) {
      showToast(result.error.message);
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
    setIsLoading(true);
    const result = await postSignIn({ email, password });
    setIsLoading(false);

    if (result?.error) {
      showToast(result.error.message);
      return false;
    }
    if (result?.data) {
      await saveAuthData(result.data);
      return true;
    }
  };

  const signOut = async () => {
    // // prod
    // setSession(null);
    // router.replace('/sign-in');

    ////////////////////////////

    // dev

    let error = false;

    const factsStorageResult = await deleteFactsDataFromAsyncStorage();
    if (factsStorageResult.error) error = true;
    const result = await getResetFacts({
      token: session?.token as string,
      userId: session?.user.id as string,
    });
    if (!!result?.data) {
    }
    console.info(`${red}%s${reset}`, 'Facts data is reset in DB');

    const authResult = await deleteAuthDataFromSecureStore();
    if (authResult.error) error = true;

    if (error) {
      showToast('Unable to clear data');
    } else {
      setSession(null);
      router.replace('/sign-in');
    }
  };

  const value = {
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
