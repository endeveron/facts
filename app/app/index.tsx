import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { SafeAreaView } from '@/components/SafeAreaView';
import { StatusBar } from '@/components/StatusBar';
import { Text } from '@/components/Text';
import { useAppContext } from '@/core/context/AppContext';
import { deleteFactsDataFromAsyncStorage } from '@/core/helpers/store';

const Index = () => {
  const { auth } = useAppContext();

  const handleSignin = async () => {
    router.push('/sign-in');
  };

  const handleClear = async () => {
    await deleteFactsDataFromAsyncStorage();
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
                title="Home"
                handlePress={() => router.push('/home')}
                containerClassName="w-48"
              />
              <Button
                title="Dashboard"
                handlePress={() => router.push('/dashboard')}
                containerClassName="mt-6 w-48"
              />
              <Button
                title="Clear Storage"
                handlePress={handleClear}
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
