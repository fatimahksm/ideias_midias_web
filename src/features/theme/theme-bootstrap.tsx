'use client';

import {useEffect} from 'react';
import {applyThemeVariables} from '@/lib/theme/css-variables';
import {defaultTheme} from '@/lib/theme/default-theme';
import {getPublicThemeSettings} from './api';

export default function ThemeBootstrap() {
  useEffect(() => {
    let mounted = true;

    async function loadTheme() {
      try {
        const theme = await getPublicThemeSettings();

        if (!mounted) return;

        applyThemeVariables({
          ...defaultTheme,
          ...theme
        });
      } catch {
        if (!mounted) return;

        applyThemeVariables(defaultTheme);
      }
    }

    loadTheme();

    return () => {
      mounted = false;
    };
  }, []);

  return null;
}