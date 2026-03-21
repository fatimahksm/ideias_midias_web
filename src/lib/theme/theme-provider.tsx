'use client';

import {useEffect} from 'react';
import {defaultTheme} from '@/lib/theme/default-theme';
import {applyThemeVariables} from '@/lib/theme/css-variables';
import type {ThemeSettings} from './types';

type Props = {
  children: React.ReactNode;
  theme?: Partial<ThemeSettings> | null;
};

export default function ThemeProvider({children, theme}: Props) {
  useEffect(() => {
    applyThemeVariables({
      ...defaultTheme,
      ...theme
    });
  }, [theme]);

  return <>{children}</>;
}