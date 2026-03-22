import {z} from 'zod';

function colorField(errorKey: string) {
  return z
    .string({error: errorKey})
    .trim()
    .min(1, {error: errorKey})
    .max(20, {error: 'colorTooLong'});
}

export const themeSettingsSchema = z.object({
  primaryColor: colorField('primaryColorRequired'),
  secondaryColor: colorField('secondaryColorRequired'),
  accentColor: colorField('accentColorRequired'),
  backgroundColor: colorField('backgroundColorRequired'),
  textColor: colorField('textColorRequired'),
  heroOverlayColor: colorField('heroOverlayColorRequired')
});

export type ThemeSettingsFormValues = z.infer<typeof themeSettingsSchema>;