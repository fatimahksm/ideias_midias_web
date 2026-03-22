import {setRequestLocale} from 'next-intl/server';
import {AdminShell} from '@/features/admin-layout/components/admin-shell';
import {AdminSessionGuard} from '@/features/admin-layout/components/admin-session-guard';

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export default async function ProtectedAdminLayout({children, params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  return (
    <AdminShell>
      <AdminSessionGuard>{children}</AdminSessionGuard>
    </AdminShell>
  );
}