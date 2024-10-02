import { z } from 'zod';

const baseAuth = {
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .trim()
    .max(40, 'Password should be at most 40 characters')
    .refine(
      (value) =>
        /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,40}$/.test(value ?? ''),
      'Password should contain at least 6 characters, one uppercase letter and number.'
    ),
};

export const signInSchema = z.object(baseAuth);
export const signUpSchema = z.object({
  ...baseAuth,
  name: z
    .string()
    .trim()
    .min(2, 'Name should contain at least 2 alphabets')
    .max(40, 'Name should contain at most 40 alphabets')
    .refine(
      (value) => /^[a-zA-Z]+[-'s]?[a-zA-Z]+$/.test(value ?? ''),
      'Name should contain only alphabets'
    ),
});

export const factSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, 'Field should contain at least 10 characters')
    .max(100, 'Field should contain at most 100 characters')
    .refine(
      (value) => /^[a-zA-Z0-9 .,:!$%'"-]+$/.test(value ?? ''),
      `Field contains invalid characters. Allowed .,:!$%'"-`
    ),
});

export type TSignInFormData = z.infer<typeof signInSchema>;
export type TSignUpFormData = z.infer<typeof signUpSchema>;
export type TFactFormData = z.infer<typeof factSchema>;
