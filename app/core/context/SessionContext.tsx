import { router } from 'expo-router';
import * as TaskManager from 'expo-task-manager';

import { DEFAULT_REDIRECT_URL } from '@/core/constants';
import {
  TAuthCredentials,
  TAuthData,
  TAuthSession,
  TSessionContext,
} from '@/core/types/auth';

import {
  deleteAuthDataFromSecureStore,
  deleteFactsDataFromAsyncStorage,
  getAuthDataFromSecureStore,
  saveAuthDataInSecureStore,
} from '@/core/helpers/store';
import { postSignIn, postSignUp } from '@/core/services/auth';
import { getResetFacts } from '@/core/services/users';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

import { consoleClors } from '@/core/constants/colors';
import { useLogging, writeLog } from '@/core/context/LoggingProvider';
import { useToast } from '@/core/hooks/useToast';
import { logMessage } from '@/core/helpers/misc';
const { green, red, reset } = consoleClors;

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
  const { addLog } = useLogging();

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
    try {
      setIsLoading(true);
      const result = await postSignUp({ name, email, password });
      setIsLoading(false);
      if (result?.error) {
        showToast(result.error.message);
        logMessage(result.error.message, 'error');
        return false;
      }
      if (result?.data) {
        await saveAuthData(result.data);
        return true;
      }
    } catch (error: any) {
      showToast(error.message);
      logMessage(error.message, 'error');
      return false;
    }
  };

  const signIn = async ({
    email,
    password,
  }: TAuthCredentials): Promise<boolean | undefined> => {
    try {
      setIsLoading(true);
      const result = await postSignIn({ email, password });
      setIsLoading(false);

      if (result?.error) {
        showToast(result.error.message);
        logMessage(result.error.message, 'error');
        return false;
      }
      if (result?.data) {
        await saveAuthData(result.data);
        return true;
      }
    } catch (error: any) {
      showToast(error.message);
      logMessage(error.message, 'error');
      return false;
    }
  };

  const signOut = async () => {
    try {
      // clear storage
      const factsStorageResult = await deleteFactsDataFromAsyncStorage();
      if (factsStorageResult.error) {
        throw new Error(factsStorageResult.error.message);
      }
      logMessage('Facts data removed from storage', 'success');

      // reset facts data in db
      const resetFactsRes = await getResetFacts({
        token: session?.token as string,
        userId: session?.user.id as string,
      });
      if (resetFactsRes?.error) {
        throw new Error(resetFactsRes.error.message);
      }
      logMessage('Facts data is reset in DB', 'success');

      const authRes = await deleteAuthDataFromSecureStore();
      if (authRes?.error) {
        throw new Error(authRes.error.message);
      }
      logMessage('Auth data removed from storage', 'success');

      await TaskManager.unregisterAllTasksAsync();
      logMessage('All tasks unregistered', 'success');

      setSession(null);
      logMessage('Signing out');
      router.replace('/sign-in');
    } catch (error: any) {
      showToast('Unable to sign out');
      logMessage(`Unable to clear data. ${error.message}`, 'error');
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
