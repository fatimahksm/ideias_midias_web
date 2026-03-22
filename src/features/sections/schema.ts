import {z} from 'zod';

export const sectionSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, {message: 'slugRequired'})
    .max(180, {message: 'slugTooLong'}),

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

  sectionType: z.enum([
    'CONTENT',
    'CATEGORY_ITEMS',
    'DIRECT_ITEMS',
    'PORTFOLIO'
  ]),

  coverImageUrl: z.string().trim(),
  coverVideoUrl: z.string().trim(),

  isActive: z.boolean(),

  sortOrder: z
    .number({
      error: 'sortOrderInvalid'
    })
    .int({message: 'sortOrderInvalid'})
    .min(0, {message: 'sortOrderMin'})
});

export type SectionFormValues = z.infer<typeof sectionSchema>;