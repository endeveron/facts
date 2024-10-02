import classNames from 'classnames';
import { LinearGradient } from 'expo-linear-gradient';
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
        className={`relative z-10 text-white text-base font-psemibold ${textClassName}`}
      >
        {title}
      </Text>
      <LinearGradient
        className="absolute inset-x-0 inset-y-0 h-full z-0"
        colors={['#ef5d0c', '#eb1059']}
        start={[0, 1]}
        end={[1, 0]}
      />
    </TouchableOpacity>
  );
};
