import {z} from 'zod';

export const portfolioProjectMediaSchema = z.object({
  projectId: z
    .number({
      error: 'projectRequired'
    })
    .int({message: 'projectRequired'})
    .min(1, {message: 'projectRequired'}),

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

export type PortfolioProjectMediaFormValues = z.infer<
  typeof portfolioProjectMediaSchema
>;