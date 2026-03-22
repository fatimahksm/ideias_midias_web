import {z} from 'zod';

export const itemMediaSchema = z.object({
  itemId: z
    .number({
      error: 'itemRequired'
    })
    .int({message: 'itemRequired'})
    .min(1, {message: 'itemRequired'}),

  mediaType: z.enum(['IMAGE', 'VIDEO'], {
    error: 'mediaTypeRequired'
  }),

  mediaUrl: z
    .string()
    .trim()
    .min(1, {message: 'mediaUrlRequired'}),

  thumbnailUrl: z.string().trim(),

  altTextPt: z
    .string()
    .trim()
    .max(255, {message: 'altTextPtTooLong'}),

  altTextEn: z
    .string()
    .trim()
    .max(255, {message: 'altTextEnTooLong'}),

  isActive: z.boolean(),

  sortOrder: z
    .number({
      error: 'sortOrderInvalid'
    })
    .int({message: 'sortOrderInvalid'})
    .min(0, {message: 'sortOrderMin'})
});

export type ItemMediaFormValues = z.infer<typeof itemMediaSchema>;