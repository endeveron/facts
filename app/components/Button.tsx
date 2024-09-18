import { useThemeColor } from '@/core/hooks/useThemeColor';
import classNames from 'classnames';
import { Text, TouchableOpacity } from 'react-native';

export const Button = ({
  title,
  handlePress,
  containerClassName,
  textClassName,
  isLoading,
}: {
  title: string;
  handlePress: () => void;
  containerClassName?: string;
  textClassName?: string;
  isLoading?: boolean;
}) => {
  const backgroundColor = useThemeColor('accent');

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={{ backgroundColor }}
      className={classNames(
        `rounded-full min-h-[56px] flex flex-row justify-center items-center transition-opacity ${containerClassName}`,
        {
          'opacity-50': isLoading,
        }
      )}
      disabled={isLoading}
    >
      <Text className={`text-white text-base font-psemibold ${textClassName}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
