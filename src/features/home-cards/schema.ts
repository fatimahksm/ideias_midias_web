import {z} from 'zod';

export const homeCardSchema = z.object({
  sectionId: z
    .number({
      error: 'sectionRequired'
    })
    .int({message: 'sectionRequired'})
    .min(1, {message: 'sectionRequired'}),

  titlePt: z
    .string()
    .trim()
    .min(1, {message: 'titlePtRequired'})
    .max(255, {message: 'titlePtTooLong'}),

  titleEn: z
    .string()
    .trim()
    .min(1, {message: 'titleEnRequired'})
    .max(255, {message: 'titleEnTooLong'}),

  shortDescriptionPt: z.string().trim(),
  shortDescriptionEn: z.string().trim(),
  imageUrl: z.string().trim(),
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

export type HomeCardFormValues = z.infer<typeof homeCardSchema>;