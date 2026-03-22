import {setRequestLocale} from 'next-intl/server';
import AdminLoginPageClient from '@/features/auth/components/admin-login-page-client';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function AdminLoginPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  return <AdminLoginPageClient />;
}