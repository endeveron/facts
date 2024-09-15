import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { useThemeColor } from '@/core/hooks/useThemeColor';
import classNames from 'classnames';

type TCardProps = PropsWithChildren & {
  addClassName?: string;
};

const Card = ({ addClassName, children }: TCardProps) => {
  const backgroundColor = useThemeColor('card');
  const borderColor = useThemeColor('border');

  return (
    <View
      style={{ borderColor, backgroundColor }}
      className={classNames('rounded-3xl border-[1px]', addClassName)}
    >
      {children}
    </View>
  );
};

export default Card;
