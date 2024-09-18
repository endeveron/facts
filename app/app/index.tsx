import { router } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import Screen from '@/components/Screen';
import { useAppContext } from '@/core/context/AppContext';

const Index = () => {
  const { auth } = useAppContext();
  const isAuthenticated = auth.session?.token !== null;

  return (
    <Screen>
      <View className="h-full flex justify-center items-center px-4 z-10">
        {isAuthenticated ? (
          <>
            <Button
              title="Facts"
              handlePress={() => router.push('/facts')}
              containerClassName="w-48"
            />
            <Button
              title="Sign Out"
              handlePress={auth.signOut}
              containerClassName="mt-6 w-48"
            />
          </>
        ) : (
          <Button
            title="Sign In"
            handlePress={() => router.push('/sign-in')}
            containerClassName="w-48"
          />
        )}
      </View>
    </Screen>
  );
};

export default Index;
