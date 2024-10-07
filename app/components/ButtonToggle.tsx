import { useThemeColor, useThemeGradient } from '@/core/hooks/useThemeColor';
import classNames from 'classnames';
import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type TButtonToggleProps = {
  onChange: (isToggled: boolean) => void;
  isActive?: boolean;
};

export const ButtonToggle = ({ onChange, isActive }: TButtonToggleProps) => {
  const accentColor = useThemeColor('accent');
  const mutedColor = useThemeColor('muted');
  const backgroundColor = useThemeColor('background');

  const [isToggled, setToggled] = useState(!!isActive);

  const handlePress = () => {
    onChange(!isToggled);
    setToggled((prev) => !prev);
  };

  useEffect(() => {
    if (isActive !== undefined) setToggled(isActive);
  }, [isActive]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.5}
      style={{
        borderWidth: 2,
        borderColor: mutedColor,
        backgroundColor,
      }}
      className={classNames(
        'flex-row rounded-full h-6 w-12 py-3 px-1 flex items-center transition-opacity opacity-80',
        {
          'flex-row-reverse': isToggled,
        }
      )}
    >
      <View
        style={{ backgroundColor: isToggled ? accentColor : mutedColor }}
        className="h-4 w-4 rounded-full"
      ></View>
    </TouchableOpacity>
  );
};
