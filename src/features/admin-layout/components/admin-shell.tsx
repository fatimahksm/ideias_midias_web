'use client';

import {AdminHeader} from './admin-header';
import {AdminSidebar} from './admin-sidebar';

type Props = {
  children: React.ReactNode;
};

export function AdminShell({children}: Props) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-b border-slate-200 bg-slate-50 lg:border-b-0 lg:border-r">
        <AdminSidebar />
      </aside>

      <div className="min-w-0">
        <AdminHeader />
        <main className="px-4 py-4 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}