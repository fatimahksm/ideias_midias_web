import {z} from 'zod';

// Strict 6-digit hex only: the native color picker only ever produces this
// shape, and the rest of the palette gets computed from these two values
// (see lib/theme/derive-theme.ts), which needs real RGB math — not
// something that can be done with an arbitrary rgb()/hsl()/named color.
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function hexColorField(errorKey: string) {
  return z
    .string({error: errorKey})
    .trim()
    .min(1, {error: errorKey})
    .regex(HEX_COLOR, {error: 'colorInvalidFormat'});
}

export const themeSettingsSchema = z.object({
  primaryColor: hexColorField('primaryColorRequired'),
  textColor: hexColorField('textColorRequired')
});

export type ThemeSettingsFormValues = z.infer<typeof themeSettingsSchema>;
