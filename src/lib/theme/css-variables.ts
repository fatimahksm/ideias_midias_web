import type {ThemeSettings} from './types';

export function applyThemeVariables(theme: ThemeSettings) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  root.style.setProperty('--color-primary', theme.primaryColor);
  root.style.setProperty('--color-secondary', theme.secondaryColor);
  root.style.setProperty('--color-accent', theme.accentColor);
  root.style.setProperty('--color-background', theme.backgroundColor);
  root.style.setProperty('--color-text', theme.textColor);
  root.style.setProperty('--color-hero-overlay', theme.heroOverlayColor);
}