import type {ThemeSettings} from './types';

/**
 * The palette used until the owner saves one. Must stay in step with the
 * `:root` block in globals.css and with the backend's own defaults — when
 * these disagreed, the admin previewed one palette and the site showed another.
 */
export const defaultTheme: ThemeSettings = {
  primaryColor: '#0f172a',
  secondaryColor: '#1e293b',
  accentColor: '#2563eb',
  backgroundColor: '#f8fafc',
  textColor: '#0f172a',
  heroOverlayColor: '#0f172aa6'
};
