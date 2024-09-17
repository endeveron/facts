import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { SafeAreaView } from '@/components/SafeAreaView';
import { StatusBar } from '@/components/StatusBar';
import { useAppContext } from '@/core/context/AppContext';
import Screen from '@/components/Screen';

const Index = () => {
  const { auth } = useAppContext();
  const isAuthenticated = auth.session?.token !== null;

  return (
    <Screen>
      <View className="h-full flex justify-center items-center px-4">
        {isAuthenticated ? (
          <Button
            title="Facts"
            handlePress={() => router.push('/facts')}
            containerClassName="w-48"
          />
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
