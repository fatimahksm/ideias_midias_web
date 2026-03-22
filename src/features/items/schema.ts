import {z} from 'zod';

export const itemSchema = z.object({
  sectionId: z
    .number({
      error: 'sectionRequired'
    })
    .int({message: 'sectionRequired'})
    .min(1, {message: 'sectionRequired'}),

  categoryId: z.number().optional(),

  titlePt: z
    .string()
    .trim()
    .min(1, {message: 'titlePtRequired'}),

  titleEn: z
    .string()
    .trim()
    .min(1, {message: 'titleEnRequired'}),

  shortDescriptionPt: z.string().trim(),
  shortDescriptionEn: z.string().trim(),

  fullDescriptionPt: z.string().trim(),
  fullDescriptionEn: z.string().trim(),

  imageUrl: z.string().trim(),
  videoUrl: z.string().trim(),

  isFeatured: z.boolean(),
  isActive: z.boolean(),

  sortOrder: z
    .number({
      error: 'sortOrderInvalid'
    })
    .int({message: 'sortOrderInvalid'})
    .min(0, {message: 'sortOrderMin'})
});

export type ItemFormValues = z.infer<typeof itemSchema>;