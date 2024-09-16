import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { SafeAreaView } from '@/components/SafeAreaView';
import { Text } from '@/components/Text';
import { SIGN_IN_SUCCESS_REDIRECT_URL } from '@/core/constants';
import { useAppContext } from '@/core/context/AppContext';
import { showAlert } from '@/core/helpers/alert';
import { signUpSchema, TSignUpFormData } from '@/core/utils/validation';

const SignUp = () => {
  const { auth } = useAppContext();
  const { control, handleSubmit, setValue } = useForm<TSignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  // Fill out the form
  useEffect(() => {
    setValue('name', 'Admin');
    setValue('email', 'admin@dev.com');
    setValue('password', 'Secured123');
  }, []);

  const onSubmit: SubmitHandler<TSignUpFormData> = async (
    data: TSignUpFormData
  ) => {
    try {
      const registered = await auth.signUp({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      if (registered) {
        router.replace(SIGN_IN_SUCCESS_REDIRECT_URL);
      }
    } catch (error: any) {
      showAlert(error.message, 'Error');
    }
  };

  return (
    <SafeAreaView className="h-full">
      <ScrollView
        contentContainerStyle={{
          height: '100%',
        }}
      >
        <View className="h-full flex justify-center p-4">
          <Text className="text-3xl font-pbold mb-6">Sign Up</Text>

          <Controller
            control={control}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <FormField
                name="name"
                label="Name"
                value={value}
                onBlur={onBlur}
                handleChangeText={onChange}
                containerClassName="mt-6"
                error={error}
              />
            )}
            name="name"
          />

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
            title="Sign Up"
            handlePress={handleSubmit(onSubmit)}
            containerClassName="mt-8"
            isLoading={auth.isLoading}
          />
          <View className="flex justify-center py-12 flex-row gap-3">
            <Text colorName="muted" className="font-pmedium">
              Have an account already?
            </Text>
            <Link href="/sign-in">
              <Text className="ml-4 font-psemibold">Signin</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
