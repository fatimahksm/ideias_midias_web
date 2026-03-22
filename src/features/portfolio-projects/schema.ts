import {z} from 'zod';

export const portfolioProjectSchema = z.object({
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

  fullDescriptionPt: z.string().trim(),
  fullDescriptionEn: z.string().trim(),

  clientName: z.string().trim().max(255, {message: 'clientNameTooLong'}),
  projectDate: z.string().trim(),

  locationPt: z.string().trim().max(255, {message: 'locationPtTooLong'}),
  locationEn: z.string().trim().max(255, {message: 'locationEnTooLong'}),

  coverImageUrl: z.string().trim(),
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

export type PortfolioProjectFormValues = z.infer<typeof portfolioProjectSchema>;