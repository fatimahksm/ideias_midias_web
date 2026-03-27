import {z} from 'zod';

export const createAdminUserSchema = z.object({
  fullName: z.string().trim().min(2, {message: 'fullNameRequired'}),
  email: z.string().trim().email({message: 'invalidEmail'}),
  password: z.string().min(8, {message: 'passwordTooShort'}),
  isActive: z.boolean().default(true)
});

export const updateAdminUserSchema = z.object({
  fullName: z.string().trim().min(2, {message: 'fullNameRequired'}),
  email: z.string().trim().email({message: 'invalidEmail'}),
  role: z.enum(['ADMIN', 'SUPER_ADMIN'])
});

export const resetAdminPasswordSchema = z
  .object({
    newPassword: z.string().min(8, {message: 'passwordTooShort'}),
    confirmPassword: z.string().min(8, {message: 'passwordTooShort'})
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'passwordsDoNotMatch',
    path: ['confirmPassword']
  });

export type CreateAdminUserFormValues = z.infer<typeof createAdminUserSchema>;
export type UpdateAdminUserFormValues = z.infer<typeof updateAdminUserSchema>;
export type ResetAdminPasswordFormValues = z.infer<typeof resetAdminPasswordSchema>;
