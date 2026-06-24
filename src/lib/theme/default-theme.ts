import type {ThemeSettings} from './types';

// Keep these in sync with the :root fallbacks in src/app/globals.css so there is
// no color flash before the saved theme settings load on the client.
export const defaultTheme: ThemeSettings = {
  primaryColor: '#0f172a',
  secondaryColor: '#1e293b',
  accentColor: '#2563eb',
  backgroundColor: '#f8fafc',
  textColor: '#0f172a',
  heroOverlayColor: 'rgba(15, 23, 42, 0.65)'
};