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
  deleteNotifSubFromSecureStore,
  getAuthDataFromSecureStore,
  saveAuthDataInSecureStore,
  saveNotifSubIsFetchedInAsyncStorage,
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

import { useLogging } from '@/core/context/LoggingProvider';
import { logMessage, logStoreData } from '@/core/helpers/misc';
import { useToast } from '@/core/hooks/useToast';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      // delete facts data from storage
      const factsStorageResult = await deleteFactsDataFromAsyncStorage();
      if (factsStorageResult.error) {
        throw new Error(factsStorageResult.error.message);
      }
      logMessage('[ CL ] facts data removed from storage', 'success');

      // reset facts data in db
      const resetFactsRes = await getResetFacts({
        token: session?.token as string,
        userId: session?.user.id as string,
      });
      if (resetFactsRes?.error) {
        throw new Error(resetFactsRes.error.message);
      }
      logMessage('[ CL ] facts data is reset in DB', 'success');

      // delete auth data from store
      const authRes = await deleteAuthDataFromSecureStore();
      if (authRes?.error) {
        throw new Error(authRes.error.message);
      }
      logMessage('[ CL ] auth data removed from store', 'success');

      // delete notification subscription data from store
      const subRes = await deleteNotifSubFromSecureStore();
      if (subRes?.error) {
        throw new Error(subRes.error.message);
      }
      logMessage('[ CL ] subscription data removed from store', 'success');

      // reset subscription status in storage
      const subStatRes = await saveNotifSubIsFetchedInAsyncStorage(false);
      if (subStatRes?.error) {
        throw new Error(subStatRes.error.message);
      }
      logMessage('[ CL ] subscription status is reset in storage', 'success');

      // unregister tasts
      await TaskManager.unregisterAllTasksAsync();
      logMessage('[ CL ] all tasks unregistered', 'success');

      // dev
      await logStoreData();

      // reset auth session
      setSession(null);
      logMessage('[ AU ] sign out');
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
