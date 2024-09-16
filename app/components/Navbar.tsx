import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { router } from 'expo-router';
import Card from '@/components/Card';
import HomeIcon from '@/components/svg/HomeIcon';

type TNavbarProps = {
  onHome?: () => Promise<void>;
};

const Navbar = ({ onHome }: TNavbarProps) => {
  const handleGoHome = async () => {
    if (onHome) await onHome();
    router.push('/');
  };

  return (
    <View className="absolute w-16 h-16 bottom-8 left-1/2 -ml-8 flex items-center justify-center z-50">
      <TouchableOpacity onPress={handleGoHome}>
        <Card addClassName="p-4 rounded-full">
          <HomeIcon />
        </Card>
      </TouchableOpacity>
    </View>
  );
};

export default Navbar;
