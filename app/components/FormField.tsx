import { useState } from 'react';
import { FieldError } from 'react-hook-form';
import {
  KeyboardTypeOptions,
  NativeSyntheticEvent,
  TextInput,
  TextInputFocusEventData,
  TouchableOpacity,
  View,
} from 'react-native';

import { Text } from '@/components/Text';
import { FormErrorMessage } from '@/components/FormErrorMessage';
import { useThemeColor } from '@/core/hooks/useThemeColor';
import EyeIcon from '@/components/icons/EyeIcon';
import EyeSlashIcon from '@/components/icons/EyeSlashIcon';

export const FormField = ({
  name,
  label,
  value,
  placeholder,
  handleChangeText,
  containerClassName,
  keyboardType,
  onBlur,
  error,
}: {
  name: string;
  label: string;
  value: string;
  handleChangeText: (text: string) => void;
  containerClassName?: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  error?: FieldError;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const textColor = useThemeColor('text');
  const inputColor = useThemeColor('input');
  const mutedColor = useThemeColor('muted');

  return (
    <View className={`space-y-2 ${containerClassName}`}>
      <Text colorName="muted" className="font-pmedium">
        {label}
      </Text>

      <View
        style={{ backgroundColor: inputColor }}
        className="w-full h-14 px-4 rounded-lg focus:border-accent flex flex-row items-center"
      >
        <TextInput
          className="flex-1 font-psemibold text-base"
          style={{ color: textColor }}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7B7B8B"
          onChangeText={handleChangeText}
          onBlur={onBlur}
          secureTextEntry={name === 'password' && !showPassword}
          keyboardType={keyboardType}
        />

        {name === 'password' && (
          <TouchableOpacity
            className="opacity-50 px-2 py-4"
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon color={mutedColor} />
            ) : (
              <EyeIcon color={mutedColor} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <FormErrorMessage>{error.message}</FormErrorMessage>}
    </View>
  );
};
