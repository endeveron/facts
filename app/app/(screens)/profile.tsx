import { Button } from '@/components/Button';
import ScrollScreen from '@/components/ScrollScreen';
import { useAppContext } from '@/core/context/AppContext';
import { router } from 'expo-router';
import { View } from 'react-native';

const profile = () => {
  const { auth } = useAppContext();

  return (
    <ScrollScreen title="Profile">
      <View className="items-center px-4">
        <Button
          title="New fact"
          handlePress={() => router.push('/create')}
          containerClassName="w-48"
        />
        <Button
          title="Favourites"
          handlePress={() => router.push('/favourites')}
          containerClassName="mt-6 w-48"
        />
        <Button
          title="Sign Out"
          handlePress={auth.signOut}
          containerClassName="mt-6 w-48"
        />
      </View>
    </ScrollScreen>
  );
};

export default profile;
