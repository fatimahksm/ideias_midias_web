import {z} from 'zod';

export const categorySchema = z.object({
  sectionId: z
    .number({
      error: 'sectionIdInvalid'
    })
    .int({message: 'sectionIdInvalid'})
    .min(1, {message: 'sectionIdRequired'}),

  namePt: z
    .string()
    .trim()
    .min(1, {message: 'namePtRequired'})
    .max(255, {message: 'namePtTooLong'}),

  nameEn: z
    .string()
    .trim()
    .min(1, {message: 'nameEnRequired'})
    .max(255, {message: 'nameEnTooLong'}),

  descriptionPt: z.string().trim(),
  descriptionEn: z.string().trim(),

  isActive: z.boolean(),

  sortOrder: z
    .number({
      error: 'sortOrderInvalid'
    })
    .int({message: 'sortOrderInvalid'})
    .min(0, {message: 'sortOrderMin'})
});

export type CategoryFormValues = z.infer<typeof categorySchema>;