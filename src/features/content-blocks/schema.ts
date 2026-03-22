import {z} from 'zod';

export const contentBlockSchema = z.object({
  sectionId: z
    .number({
      error: 'sectionRequired'
    })
    .int({message: 'sectionRequired'})
    .min(1, {message: 'sectionRequired'}),

  blockType: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'TEXT_IMAGE', 'GALLERY'], {
    error: 'blockTypeRequired'
  }),

  titlePt: z.string().trim().max(255, {message: 'titlePtTooLong'}),
  titleEn: z.string().trim().max(255, {message: 'titleEnTooLong'}),

  subtitlePt: z.string().trim().max(255, {message: 'subtitlePtTooLong'}),
  subtitleEn: z.string().trim().max(255, {message: 'subtitleEnTooLong'}),

  contentPt: z.string().trim(),
  contentEn: z.string().trim(),

  imageUrl: z.string().trim(),
  videoUrl: z.string().trim(),

  isActive: z.boolean(),

  sortOrder: z
    .number({
      error: 'sortOrderInvalid'
    })
    .int({message: 'sortOrderInvalid'})
    .min(0, {message: 'sortOrderMin'})
});

export type ContentBlockFormValues = z.infer<typeof contentBlockSchema>;