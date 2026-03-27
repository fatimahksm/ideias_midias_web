'use client';

import {useEffect, useMemo, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import LanguageSwitcher from '@/components/common/language-switcher';
import LoginForm from './login-form';
import {clearAdminSession, getAdminToken} from '@/lib/auth/token';
import {useAdminSession} from '@/features/admin-layout/hooks/use-admin-session';

function LoginStateCard({label}: {label: string}) {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-[var(--color-text)]">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-600">{label}</p>
        </div>
      </div>
    </main>
  );
}

export default function AdminLoginPageClient() {
  const t = useTranslations('AdminLoginPage');
  const locale = useLocale();
  const router = useRouter();

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const storedToken = useMemo(() => {
    if (!isHydrated) return null;
    return getAdminToken();
  }, [isHydrated]);

  const sessionQuery = useAdminSession(Boolean(storedToken));

  useEffect(() => {
    if (!storedToken) return;

    if (sessionQuery.data) {
      router.replace(`/${locale}/admin`);
    }
  }, [storedToken, sessionQuery.data, locale, router]);

  useEffect(() => {
    if (!storedToken) return;

    if (sessionQuery.isError) {
      clearAdminSession();
    }
  }, [storedToken, sessionQuery.isError]);

  if (!isHydrated) {
    return <LoginStateCard label={t('checkingSession')} />;
  }

  if (storedToken && (sessionQuery.isPending || sessionQuery.isSuccess)) {
    return <LoginStateCard label={t('redirectingAuthenticated')} />;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-[var(--color-text)]">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
          <p className="mb-6 text-slate-600">{t('subtitle')}</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}