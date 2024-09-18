import { Redirect } from 'expo-router';

import Screen from '@/components/Screen';
import {
  SIGN_IN_SUCCESS_REDIRECT_URL,
  SIGN_OUT_REDIRECT_URL,
} from '@/core/constants';
import { useAppContext } from '@/core/context/AppContext';

const Index = () => {
  const { auth } = useAppContext();

  return (
    <Screen>
      {auth.session !== null ? (
        <Redirect href={SIGN_IN_SUCCESS_REDIRECT_URL} />
      ) : (
        <Redirect href={SIGN_OUT_REDIRECT_URL} />
      )}
    </Screen>
  );
};

export default Index;
