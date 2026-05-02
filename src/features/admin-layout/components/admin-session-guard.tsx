'use client';

import {useEffect, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {clearAdminSession} from '@/lib/auth/token';
import {useAdminSession} from '../hooks/use-admin-session';

type Props = {
  children: React.ReactNode;
};

function StateCard({
  label,
  tone = 'neutral'
}: {
  label: string;
  tone?: 'neutral' | 'error';
}) {
  const toneClasses =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-slate-200 bg-white text-slate-600';

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div
        className={`w-full max-w-md rounded-2xl border px-5 py-4 text-center text-sm shadow-sm ${toneClasses}`}
      >
        {label}
      </div>
    </div>
  );
}

export function AdminSessionGuard({children}: Props) {
  const t = useTranslations('AdminLayout');
  const errorT = useTranslations('CommonErrors');
  const locale = useLocale();
  const router = useRouter();

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const sessionQuery = useAdminSession(isHydrated);

  const appError = sessionQuery.error ? toAppError(sessionQuery.error) : null;

  const isAuthFailure =
    appError?.status === 401 ||
    appError?.status === 403 ||
    appError?.message === 'No admin token found.' ||
    appError?.message === 'Refresh token is missing.';

  useEffect(() => {
    if (!isHydrated) return;

    if (isAuthFailure) {
      clearAdminSession();
      router.replace(`/${locale}/admin/login`);
    }
  }, [isHydrated, isAuthFailure, locale, router]);

  if (!isHydrated || sessionQuery.isPending) {
    return <StateCard label={t('checkingSession')} />;
  }

  if (isAuthFailure) {
    return <StateCard label={t('redirectingToLogin')} />;
  }

  if (sessionQuery.isError) {
    return (
      <StateCard
        tone="error"
        label={getErrorMessage(appError, (key) => errorT(key))}
      />
    );
  }

  return <>{children}</>;
}