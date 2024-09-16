import { Text } from '@/components/Text';
import { useThemeColor } from '@/core/hooks/useThemeColor';
import classNames from 'classnames';
import { TouchableOpacity, View } from 'react-native';

export type TCategoryItemProps = {
  isActive: boolean;
  name: string;
  onPress: (name: string) => void;
};

const CategoryItem = ({ isActive, name, onPress }: TCategoryItemProps) => {
  const secondaryColor = useThemeColor('secondary');
  const inversedBgColor = useThemeColor('inversedBg');

  const backgroundColor = isActive ? inversedBgColor : secondaryColor;

  return (
    <TouchableOpacity
      onPress={() => onPress(name)}
      className="h-16 items-center justify-center"
    >
      <View
        style={{ backgroundColor }}
        className="flex-1 items-center justify-center rounded-full m-2 py-4 px-5"
      >
        <Text
          colorName={isActive ? 'inversed' : 'text'}
          className={classNames('text-xs uppercase font-pmedium', {
            'font-pextrabold': isActive,
          })}
        >
          {name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CategoryItem;
