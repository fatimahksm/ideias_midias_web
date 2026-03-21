import {z} from 'zod';

export const siteSettingsSchema = z.object({
  companyNamePt: z
    .string({error: 'companyNamePtRequired'})
    .trim()
    .min(1, {error: 'companyNamePtRequired'})
    .max(255, {error: 'companyNamePtTooLong'}),

  companyNameEn: z
    .string({error: 'companyNameEnRequired'})
    .trim()
    .min(1, {error: 'companyNameEnRequired'})
    .max(255, {error: 'companyNameEnTooLong'}),

  shortIntroPt: z.string().trim().nullable().optional(),
  shortIntroEn: z.string().trim().nullable().optional(),

  heroTitlePt: z.string().trim().max(255, {error: 'heroTitlePtTooLong'}).nullable().optional(),
  heroTitleEn: z.string().trim().max(255, {error: 'heroTitleEnTooLong'}).nullable().optional(),

  heroSubtitlePt: z.string().trim().nullable().optional(),
  heroSubtitleEn: z.string().trim().nullable().optional(),

  logoUrl: z.string().trim().nullable().optional(),

  heroBackgroundType: z.enum(['IMAGE', 'VIDEO'], {
    error: 'heroBackgroundTypeRequired'
  }),

  heroBackgroundUrl: z.string().trim().nullable().optional(),
  companyVideoUrl: z.string().trim().nullable().optional(),

  addressPt: z.string().trim().nullable().optional(),
  addressEn: z.string().trim().nullable().optional(),

  mapEmbedUrl: z.string().trim().nullable().optional(),

  locationLat: z
    .union([z.number(), z.null(), z.undefined()])
    .refine(
      (value) => value == null || (value >= -90 && value <= 90),
      {error: 'invalidLatitude'}
    ),

  locationLng: z
    .union([z.number(), z.null(), z.undefined()])
    .refine(
      (value) => value == null || (value >= -180 && value <= 180),
      {error: 'invalidLongitude'}
    )
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;