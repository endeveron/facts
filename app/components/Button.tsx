import { useThemeColor, useThemeGradient } from '@/core/hooks/useThemeColor';
import classNames from 'classnames';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TouchableOpacity, View } from 'react-native';

export const Button = ({
  title,
  handlePress,
  variant = 'primary',
  containerClassName,
  textClassName,
  isLoading,
}: {
  title: string;
  handlePress: () => void;
  variant?: 'primary' | 'secondary';
  containerClassName?: string;
  textClassName?: string;
  isLoading?: boolean;
}) => {
  const brandButtonGradient = useThemeGradient('brandButton');
  const secondaryColor = useThemeColor('secondary');

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className={classNames(
        `relative overflow-hidden rounded-full min-h-[56px] flex flex-row justify-center items-center transition-opacity ${containerClassName}`,
        {
          'opacity-50': isLoading,
        }
      )}
      disabled={isLoading}
    >
      <Text
        className={classNames(
          `relative z-10 text-white text-base font-psemibold ${textClassName}`,
          {
            'opacity-70': variant === 'secondary',
          }
        )}
      >
        {title}
      </Text>
      {variant === 'primary' ? (
        <LinearGradient
          className="absolute inset-x-0 inset-y-0 h-full z-0"
          colors={brandButtonGradient}
          start={[0, 1]}
          end={[1, 0]}
        />
      ) : (
        <View
          style={{ backgroundColor: secondaryColor }}
          className="absolute inset-x-0 inset-y-0 h-full z-0"
        ></View>
      )}
    </TouchableOpacity>
  );
};
