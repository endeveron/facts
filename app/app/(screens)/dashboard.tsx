import { View } from 'react-native';

import { SafeAreaView } from '@/components/SafeAreaView';
import { StatusBar } from '@/components/StatusBar';
import { Text } from '@/components/Text';
import { useAppContext } from '@/core/context/AppContext';

const Dashboard = () => {
  const { auth } = useAppContext();

  const name = auth.session?.user?.account.name;
  const email = auth.session?.user?.account.email;

  return (
    <SafeAreaView className="relative h-full">
      <View className="p-4">
        <Text className="my-4 text-3xl font-pbold">Dashboard</Text>
      </View>

      <StatusBar />
    </SafeAreaView>
  );
};

export default Dashboard;
