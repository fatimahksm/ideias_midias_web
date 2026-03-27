'use client';

import {useEffect, useMemo, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import LanguageSwitcher from '@/components/common/language-switcher';
import {Button} from '@/components/ui/button';
import {clearAdminSession, getAdminToken} from '@/lib/auth/token';
import {useAdminSession} from '../hooks/use-admin-session';

export function AdminHeader() {
  const t = useTranslations('AdminLayout');
  const common = useTranslations('Common');
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

  const displayName =
    sessionQuery.data?.fullName?.trim() ||
    sessionQuery.data?.email?.trim() ||
    t('brandName');

  function handleLogout() {
    clearAdminSession();
    router.replace(`/${locale}/admin/login`);
  }

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex flex-col gap-4 px-4 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">{t('welcome')}</p>
          <p className="text-sm text-slate-500">
            {t('signedInAs', {name: displayName})}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LanguageSwitcher />
          <Button type="button" variant="outline" onClick={handleLogout}>
            {common('logout')}
          </Button>
        </div>
      </div>
    </header>
  );
}