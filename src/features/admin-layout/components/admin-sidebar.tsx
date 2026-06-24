'use client';

import {useMemo} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {usePathname} from 'next/navigation';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/cn';
import {hasAdminToken} from '@/lib/auth/token';
import {useAdminSession} from '../hooks/use-admin-session';
import {
  adminNavigation,
  adminNavigationGroups,
  type AdminNavigationGroup
} from '../constants/admin-navigation';

type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

const groupLabelKey: Record<AdminNavigationGroup, string> = {
  overview: 'groupOverview',
  content: 'groupContent',
  appearance: 'groupAppearance',
  system: 'groupSystem'
};

export function AdminSidebar() {
  const t = useTranslations('AdminLayout');
  const locale = useLocale();
  const pathname = usePathname();
  const sessionQuery = useAdminSession(hasAdminToken());

  const visibleNavigation = useMemo(() => {
    const role = sessionQuery.data?.role as AdminRole | undefined;

    return adminNavigation.filter((item) => {
      if (!item.visibleFor || item.visibleFor.length === 0) {
        return true;
      }

      if (!role) {
        return false;
      }

      return item.visibleFor.includes(role);
    });
  }, [sessionQuery.data?.role]);

  return (
    <div className="flex h-full flex-col gap-6 p-4 md:p-6">
      <div className="space-y-1">
        <p className="text-lg font-bold text-slate-900">{t('brandName')}</p>
        <p className="text-sm text-slate-500">{t('brandTagline')}</p>
      </div>

      <nav className="flex flex-col gap-5">
        {adminNavigationGroups.map((group) => {
          const items = visibleNavigation.filter(
            (item) => item.group === group
          );

          if (items.length === 0) {
            return null;
          }

          return (
            <div key={group} className="space-y-2">
              <p className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {t(groupLabelKey[group])}
              </p>

              <div className="grid gap-2">
                {items.map((item) => {
                  const localizedHref = `/${locale}${item.href}`;
                  const isActive =
                    pathname === localizedHref ||
                    (item.href !== '/admin' &&
                      pathname.startsWith(`${localizedHref}/`));

                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={cn(
                        'rounded-2xl px-4 py-3 text-sm font-medium transition',
                        isActive
                          ? 'bg-[var(--color-primary)] text-white shadow-sm'
                          : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      {t(item.labelKey)}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
