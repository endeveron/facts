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
  deleteNotifSubFromSecureStore,
  getAuthDataFromSecureStore,
  removeNotifSubFetchedFromAsyncStorage,
  saveAuthDataInSecureStore,
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
        console.error(result.error.message);
        return false;
      }
      if (result?.data) {
        await saveAuthData(result.data);
        return true;
      }
    } catch (error: any) {
      showToast(error.message);
      console.error(error.message);
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
        console.error(result.error.message);
        return false;
      }
      if (result?.data) {
        await saveAuthData(result.data);
        return true;
      }
    } catch (error: any) {
      showToast(error.message);
      console.error(error.message);
      return false;
    }
  };

  const signOut = async () => {
    try {
      // // reset facts data in remote db
      // const resetFactsRes = await getResetFacts({
      //   token: session?.token as string,
      //   userId: session?.user.id as string,
      // });
      // if (resetFactsRes?.error) {
      //   await logMessage(
      //     `[ CL ] unable to reset facts data in db: ${resetFactsRes.error.message}`,
      //     'error'
      //   );
      // }
      // await logMessage('[ CL ] facts data is reset in DB', 'success');

      // delete auth data from store
      const authRes = await deleteAuthDataFromSecureStore();
      if (authRes?.error) {
        await logMessage(
          `[ CL ] unable to delete auth data from store: ${authRes.error.message}`,
          'error'
        );
      }
      await logMessage('[ CL ] auth data removed from store', 'success');

      // // delete notification subscription data from store
      // const subRes = await deleteNotifSubFromSecureStore();
      // if (subRes?.error) {
      //   await logMessage(
      //     `[ CL ] unable to delete notification subscription data from store: ${subRes.error.message}`,
      //     'error'
      //   );
      // }
      // await logMessage(
      //   '[ CL ] subscription data removed from store',
      //   'success'
      // );

      // // reset subscription status in storage
      // const subStatRes = await removeNotifSubFetchedFromAsyncStorage();
      // if (subStatRes?.error) {
      //   await logMessage(
      //     `[ CL ] unable to reset subscription status in storage: ${subStatRes.error.message}`,
      //     'error'
      //   );
      // }
      // await logMessage(
      //   '[ CL ] subscription status is reset in storage',
      //   'success'
      // );

      // unregister tasts
      await TaskManager.unregisterAllTasksAsync();
      await logMessage('[ CL ] all tasks unregistered', 'success');

      // // dev
      // await logStoreData();

      // reset auth session
      setSession(null);
      await logMessage('[ AU ] sign out');
      router.replace('/sign-in');
    } catch (error: any) {
      // showToast('Unable to sign out');
      await logMessage(
        `[ CL ] unable to clear data. ${error.message}`,
        'error'
      );
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
