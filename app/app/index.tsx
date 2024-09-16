import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { SafeAreaView } from '@/components/SafeAreaView';
import { StatusBar } from '@/components/StatusBar';
import { Text } from '@/components/Text';
import { useAppContext } from '@/core/context/AppContext';

const Index = () => {
  const { auth } = useAppContext();

  const handleSignin = async () => {
    router.push('/sign-in');
  };

  return (
    <SafeAreaView className="h-full">
      <ScrollView
        contentContainerStyle={{
          height: '100%',
        }}
      >
        <View className="h-full flex justify-center items-center px-4">
          <Text className="my-8 text-4xl font-pbold">Welcome!</Text>
          {auth.session?.token ? (
            <>
              <Button
                title="Facts"
                handlePress={() => router.push('/facts')}
                containerClassName="w-48"
              />
              <Button
                title="Favorites"
                handlePress={() => router.push('/favorites')}
                containerClassName="mt-6 w-48"
              />
              <Button
                title="New fact"
                handlePress={() => router.push('/create')}
                containerClassName="mt-6 w-48"
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
              handlePress={handleSignin}
              containerClassName="w-48"
            />
          )}
        </View>
      </ScrollView>
      <StatusBar />
    </SafeAreaView>
  );
};

export default Index;
