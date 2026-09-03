import {defaultTheme} from './default-theme';
import type {ThemeSettings} from './types';

/** The colours the owner can set, and the CSS custom property for each. */
type ColorKey =
  | 'primaryColor'
  | 'secondaryColor'
  | 'accentColor'
  | 'backgroundColor'
  | 'textColor'
  | 'heroOverlayColor';

const VARIABLES: Array<[ColorKey, string]> = [
  ['primaryColor', '--color-primary'],
  ['secondaryColor', '--color-secondary'],
  ['accentColor', '--color-accent'],
  ['backgroundColor', '--color-background'],
  ['textColor', '--color-text'],
  ['heroOverlayColor', '--color-hero-overlay']
];

/**
 * Fills in any colour the saved theme is missing.
 *
 * A theme that has never been saved used to arrive as an object of nulls, and
 * spreading that over the defaults produced nulls — which removes the CSS
 * variable rather than setting it, leaving the page unthemed.
 */
export function resolveTheme(theme?: Partial<ThemeSettings> | null): ThemeSettings {
  const resolved = {...defaultTheme};

  for (const [key] of VARIABLES) {
    const value = theme?.[key];

    if (typeof value === 'string' && value.trim()) {
      resolved[key] = value.trim();
    }
  }

  return resolved;
}

export function applyThemeVariables(theme?: Partial<ThemeSettings> | null) {
  if (typeof document === 'undefined') return;

  const resolved = resolveTheme(theme);
  const root = document.documentElement;

  for (const [key, variable] of VARIABLES) {
    root.style.setProperty(variable, resolved[key]);
  }
}

/**
 * The same variables as a stylesheet, so the server can put the owner's colours
 * in the first paint. Fetching them in the browser meant every visitor saw the
 * fallback palette first — and on a slow connection, for seconds.
 */
export function themeToCss(theme?: Partial<ThemeSettings> | null) {
  const resolved = resolveTheme(theme);

  const declarations = VARIABLES.map(
    ([key, variable]) => `${variable}:${resolved[key]};`
  ).join('');

  return `:root{${declarations}}`;
}
