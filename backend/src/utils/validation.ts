import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .email({ message: 'Invalid email address' })
    .min(1, { message: 'Email is required' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: 'Invalid email address' })
    .min(1, { message: 'Email is required' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' }),
});

export const verifySchema = z.object({
  token: z
    .string()
    .min(1, { message: 'Verification token is required' }),
});
