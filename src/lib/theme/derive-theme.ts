import type {ThemeSettings} from './types';

/**
 * The whole palette used to be six independent decisions, several of which
 * (Secondary, Accent, Background, Hero Overlay) rarely got picked to
 * actually relate to each other — a background chosen without regard for
 * the cards drawn on top of it, or a secondary color unrelated to primary.
 * Deriving them from Primary + Text guarantees a coherent result no matter
 * what color gets picked, and makes "change the color" actually change the
 * whole site rather than one corner of it.
 */

type RGB = {r: number; g: number; b: number};
type HSL = {h: number; s: number; l: number};

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

export function isValidThemeHex(value: string): boolean {
  return HEX_PATTERN.test(value.trim());
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const value = parseInt(clean, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function rgbToHex({r, g, b}: RGB): string {
  const toHex = (n: number) =>
    Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl({r, g, b}: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) {
    return {h: 0, s: 0, l: l * 100};
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;

  if (max === rn) {
    h = (gn - bn) / d + (gn < bn ? 6 : 0);
  } else if (max === gn) {
    h = (bn - rn) / d + 2;
  } else {
    h = (rn - gn) / d + 4;
  }

  return {h: (h / 6) * 360, s: s * 100, l: l * 100};
}

function hslToRgb({h, s, l}: HSL): RGB {
  const hn = (((h % 360) + 360) % 360) / 360;
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;

  if (sn === 0) {
    const v = Math.round(ln * 255);
    return {r: v, g: v, b: v};
  }

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;

  const hueToChannel = (t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  return {
    r: Math.round(hueToChannel(hn + 1 / 3) * 255),
    g: Math.round(hueToChannel(hn) * 255),
    b: Math.round(hueToChannel(hn - 1 / 3) * 255)
  };
}

function fromHsl(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

const FALLBACK_PRIMARY = '#0f172a';
const FALLBACK_TEXT = '#0f172a';

export function deriveTheme(
  primaryColorInput: string,
  textColorInput: string
): ThemeSettings {
  const primaryColor = isValidThemeHex(primaryColorInput)
    ? primaryColorInput
    : FALLBACK_PRIMARY;
  const textColor = isValidThemeHex(textColorInput)
    ? textColorInput
    : FALLBACK_TEXT;

  const primaryHsl = rgbToHsl(hexToRgb(primaryColor));
  const textHsl = rgbToHsl(hexToRgb(textColor));

  // A light text color reads as "this site wants a dark background" —
  // the background follows that instead of always defaulting to near-white.
  const preferDarkBackground = textHsl.l >= 55;

  // Same hue as primary, but forced into a dark band regardless of how
  // light primary itself is — this sits behind the hero's white text, so
  // it has to stay dark no matter what color gets picked.
  const secondaryColor = fromHsl({
    h: primaryHsl.h,
    s: clamp(primaryHsl.s, 25, 60),
    l: clamp(primaryHsl.l * 0.6, 10, 24)
  });

  // Same hue as primary — so the whole palette reads as "shades of your
  // color" rather than primary plus one unrelated accent — pushed to a
  // richer saturation and shifted away from primary's own lightness so it
  // still stands out as a distinct, vivid accent rather than a duplicate.
  const accentColor = fromHsl({
    h: primaryHsl.h,
    s: clamp(Math.max(primaryHsl.s, 60), 60, 90),
    l:
      primaryHsl.l >= 50
        ? clamp(primaryHsl.l - 22, 28, 45)
        : clamp(primaryHsl.l + 22, 55, 72)
  });

  // A clearly visible tint of primary's hue rather than a flat neutral, so
  // the page canvas reads as part of the same palette — light or dark to
  // match Text — without going so dark/saturated that body text loses
  // contrast against it.
  const backgroundColor = fromHsl({
    h: primaryHsl.h,
    s: clamp(primaryHsl.s * 0.5, 0, 35),
    l: preferDarkBackground ? 10 : 95
  });

  // A translucent version of primary, used as the hero gradient overlay.
  const heroOverlayColor = `${primaryColor}a6`;

  return {
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor,
    textColor,
    heroOverlayColor
  };
}
