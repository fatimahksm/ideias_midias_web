import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Providers from '../providers';
import '../globals.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import AppBootProvider from '@/components/providers/app-boot-provider';
import {getPublicThemeSettings} from '@/features/theme/api';
import {themeToCss} from '@/lib/theme/css-variables';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Ideias Midias',
  description: 'Ideias Midias website'
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // Fetched here rather than in the browser: reading it client-side meant every
  // visitor saw the fallback palette first, and on a slow connection the
  // owner's colours took seconds to arrive — or never did.
  const [messages, theme] = await Promise.all([
    getMessages(),
    getPublicThemeSettings().catch(() => null)
  ]);

  return (
    <html lang={locale}>
      <body>
        {/*
          Hoisted by React into the head via href/precedence. Rendering it as a
          plain <style> inside a hand-written <head> made the server and client
          disagree on its attributes, which React reported as a hydration
          mismatch.
        */}
        <style href="theme-variables" precedence="high">
          {themeToCss(theme)}
        </style>

        <NextIntlClientProvider messages={messages}>
          <Providers>
            <AppBootProvider>{children}</AppBootProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}