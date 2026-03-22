import {z} from 'zod';

export const contactMethodSchema = z.object({
  type: z.enum(['PHONE', 'WHATSAPP', 'EMAIL', 'SOCIAL']),
  labelPt: z
    .string()
    .trim()
    .min(1, {message: 'labelPtRequired'})
    .max(255, {message: 'labelPtTooLong'}),
  labelEn: z
    .string()
    .trim()
    .min(1, {message: 'labelEnRequired'})
    .max(255, {message: 'labelEnTooLong'}),
  value: z
    .string()
    .trim()
    .min(1, {message: 'valueRequired'})
    .max(500, {message: 'valueTooLong'}),
  iconName: z
    .string()
    .trim()
    .max(100, {message: 'iconNameTooLong'}),
  sortOrder: z
    .number({
      error: 'sortOrderInvalid'
    })
    .int({message: 'sortOrderInvalid'})
    .min(0, {message: 'sortOrderMin'}),
  isActive: z.boolean()
});

export type ContactMethodFormValues = z.infer<typeof contactMethodSchema>;