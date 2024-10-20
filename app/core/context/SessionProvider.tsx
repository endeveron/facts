import { router } from 'expo-router';
import * as TaskManager from 'expo-task-manager';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

import { DEFAULT_REDIRECT_URL } from '@/core/constants';
import { logMessage, logStoreData } from '@/core/helpers/misc';
import {
  deleteAuthDataFromSecureStore,
  deleteFactsDataFromAsyncStorage,
  deleteNotifSubFromSecureStore,
  getAuthDataFromSecureStore,
  saveAuthDataInSecureStore,
  saveNotifSubFetchedInAsyncStorage,
} from '@/core/helpers/store';
import { useToast } from '@/core/hooks/useToast';
import { postSignIn, postSignUp } from '@/core/services/auth';
import { getResetFacts } from '@/core/services/users';
import {
  TAuthCredentials,
  TAuthSession,
  TSessionContext,
  TUserAuthData,
} from '@/core/types/auth';

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

const SessionProvider = ({ children }: PropsWithChildren) => {
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<TAuthSession>(null);

  /** Updates auth state, adds auth data to SecureStore. */
  const saveAuthData = async ({ token, user }: TUserAuthData) => {
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
        logMessage(
          `[ CL ] unable to delete facts data from storage: ${factsStorageResult.error.message}`,
          'error'
        );
      }
      logMessage('[ CL ] facts data removed from storage', 'success');

      // reset facts data in db
      const resetFactsRes = await getResetFacts({
        token: session?.token as string,
        userId: session?.user.id as string,
      });
      if (resetFactsRes?.error) {
        logMessage(
          `[ CL ] unable to reset facts data in db: ${resetFactsRes.error.message}`,
          'error'
        );
      }
      logMessage('[ CL ] facts data is reset in DB', 'success');

      // delete auth data from store
      const authRes = await deleteAuthDataFromSecureStore();
      if (authRes?.error) {
        logMessage(
          `[ CL ] unable to delete auth data from store: ${authRes.error.message}`,
          'error'
        );
      }
      logMessage('[ CL ] auth data removed from store', 'success');

      // delete notification subscription data from store
      const subRes = await deleteNotifSubFromSecureStore();
      if (subRes?.error) {
        logMessage(
          `[ CL ] unable to delete notification subscription data from store: ${subRes.error.message}`,
          'error'
        );
      }
      logMessage('[ CL ] subscription data removed from store', 'success');

      // reset subscription status in storage
      const subStatRes = await saveNotifSubFetchedInAsyncStorage(false);
      if (subStatRes?.error) {
        logMessage(
          `[ CL ] unable to reset subscription status in storage: ${subStatRes.error.message}`,
          'error'
        );
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
      // showToast('Unable to sign out');
      logMessage(`[ CL ] unable to clear data. ${error.message}`, 'error');
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

export default SessionProvider;
