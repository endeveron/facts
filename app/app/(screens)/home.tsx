import { StatusBar } from 'expo-status-bar';

import Facts from '@/components/Facts';
import { SafeAreaView } from '@/components/SafeAreaView';

const Home = () => {
  return (
    <SafeAreaView className="relative h-full">
      <Facts />
      <StatusBar />
    </SafeAreaView>
  );
};

export default Home;
