import {z} from 'zod';

export const adminLoginSchema = z.object({
  email: z.email({error: 'invalidEmail'}).trim(),
  password: z
    .string({error: 'passwordRequired'})
    .trim()
    .min(1, {error: 'passwordRequired'})
});

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;