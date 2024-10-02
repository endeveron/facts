import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { View } from 'react-native';

import AuthScreen from '@/components/AuthScreen';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { Text } from '@/components/Text';
import {
  AUTH_EMAIL,
  AUTH_PASSWORD,
  DEFAULT_REDIRECT_URL,
} from '@/core/constants';
import { useSession } from '@/core/context/SessionContext';
import { useToast } from '@/core/hooks/useToast';
import { signInSchema, TSignInFormData } from '@/core/utils/validation';

const SignIn = () => {
  const { isLoading, signIn } = useSession();
  const { showToast } = useToast();
  const { control, handleSubmit, setValue } = useForm<TSignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  // fill out the form
  useEffect(() => {
    setValue('email', AUTH_EMAIL);
    setValue('password', AUTH_PASSWORD);
  }, []);

  const onSubmit: SubmitHandler<TSignInFormData> = async (
    data: TSignInFormData
  ) => {
    try {
      const loggedIn = await signIn({
        email: data.email,
        password: data.password,
      });
      if (loggedIn) {
        router.replace(DEFAULT_REDIRECT_URL);
      }
    } catch (error: any) {
      console.error(error);
      showToast('Unable to login');
    }
  };

  return (
    <AuthScreen>
      <>
        <Text className="text-3xl font-pbold mb-6">Sign In</Text>

        <Controller
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <FormField
              name="email"
              label="Email"
              value={value}
              onBlur={onBlur}
              handleChangeText={onChange}
              containerClassName="mt-6"
              error={error}
              keyboardType="email-address"
            />
          )}
          name="email"
        />

        <Controller
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <FormField
              name="password"
              label="Password"
              value={value}
              onBlur={onBlur}
              handleChangeText={onChange}
              containerClassName="mt-6"
              error={error}
            />
          )}
          name="password"
        />

        <Button
          title="Sign In"
          handlePress={handleSubmit(onSubmit)}
          containerClassName="mt-8"
          isLoading={isLoading}
        />
        <View className="flex justify-center py-12 flex-row gap-3">
          <Text colorName="muted" className="font-pmedium">
            Don't have an account?
          </Text>
          <Link href="/sign-up">
            <Text className="ml-4 font-psemibold">Signup</Text>
          </Link>
        </View>
      </>
    </AuthScreen>
  );
};

export default SignIn;
