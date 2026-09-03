import {z} from 'zod';

// Kept identical to the SAFE_COLOR pattern in lib/theme/css-variables.ts —
// that's what actually ends up applied to the page, so a value the form
// accepts but the renderer doesn't silently drops the color at save time,
// with no indication anything went wrong.
const SAFE_COLOR =
  /^(#[0-9a-f]{3,8}|(rgb|rgba|hsl|hsla)\([0-9a-z.,%\s/]+\)|[a-z]+)$/i;

function colorField(errorKey: string) {
  return z
    .string({error: errorKey})
    .trim()
    .min(1, {error: errorKey})
    .max(20, {error: 'colorTooLong'})
    .regex(SAFE_COLOR, {error: 'colorInvalidFormat'});
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