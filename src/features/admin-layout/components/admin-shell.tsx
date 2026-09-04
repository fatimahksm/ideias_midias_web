'use client';

import {Menu, X} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useState} from 'react';
import {AdminHeader} from './admin-header';
import {AdminSidebar} from './admin-sidebar';

type Props = {
  children: React.ReactNode;
};

export function AdminShell({children}: Props) {
  const t = useTranslations('AdminLayout');
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <p className="text-base font-bold text-slate-900">{t('brandName')}</p>
        <button
          type="button"
          onClick={() => setIsNavOpen(true)}
          aria-label={t('openMenu')}
          className="rounded-xl border border-slate-200 p-2 text-slate-700"
        >
          <Menu size={20} />
        </button>
      </div>

      {isNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label={t('closeMenu')}
            onClick={() => setIsNavOpen(false)}
            className="absolute inset-0 bg-slate-900/40"
          />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-xs overflow-y-auto bg-slate-50 shadow-xl">
            <div className="flex justify-end p-2">
              <button
                type="button"
                onClick={() => setIsNavOpen(false)}
                aria-label={t('closeMenu')}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            <AdminSidebar onNavigate={() => setIsNavOpen(false)} />
          </div>
        </div>
      ) : null}

      <aside className="hidden border-b border-slate-200 bg-slate-50 lg:block lg:border-b-0 lg:border-r">
        <AdminSidebar />
      </aside>

      <div className="min-w-0">
        <AdminHeader />
        <main className="px-4 py-4 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}
