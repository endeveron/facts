import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import CategoryItem from '@/components/CategoryItem';
import { FormField } from '@/components/FormField';
import { useSession } from '@/core/context/SessionContext';
import { useToast } from '@/core/hooks/useToast';
import { postFact } from '@/core/services/facts';
import { FactCategory } from '@/core/types/fact';
import { factSchema, TFactFormData } from '@/core/utils/validation';

const CreateFact = () => {
  const { session } = useSession();
  if (!session) return null;

  const { showToast } = useToast();

  const { control, handleSubmit, reset } = useForm<TFactFormData>({
    resolver: zodResolver(factSchema),
  });

  const [category, setCategory] = useState('nature');
  const [isLoading, setIsLoading] = useState(false);

  const handleCategory = (name: string) => {
    setCategory(name);
  };

  const onSubmit: SubmitHandler<TFactFormData> = async (
    data: TFactFormData
  ) => {
    try {
      setIsLoading(true);
      const result = await postFact({
        fact: {
          category,
          title: data.title,
        },
        token: session.token,
      });
      if (result?.error) showToast(result.error.message);
      if (result?.data?.factId) {
        // success
        showToast('Fact item added to database');
        reset(); // form
      }
    } catch (error: unknown) {
      console.error(error);
      showToast('Unable to save fact in db');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="px-4">
      <View className="flex-row flex-wrap -mt-2 -mx-3">
        {Object.keys(FactCategory).map((name) => (
          <CategoryItem
            onPress={handleCategory}
            isActive={category === name}
            name={name}
            key={name}
          />
        ))}
      </View>

      <View className="flex justify-center mt-4 -mx-1">
        <Controller
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <FormField
              name="title"
              value={value}
              placeholder="Up to 100 characters"
              onBlur={onBlur}
              numberOfLines={3}
              handleChangeText={onChange}
              error={error}
            />
          )}
          name="title"
        />

        <Button
          title="Submit"
          handlePress={handleSubmit(onSubmit)}
          containerClassName="mt-6"
          isLoading={isLoading}
        />
      </View>
    </View>
  );
};

export default CreateFact;
