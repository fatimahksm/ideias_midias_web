import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import AdminUsersManager from '@/features/admin-users/components/admin-users-manager';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function AdminUsersPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('AdminUsersPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <AdminUsersManager />
    </section>
  );
}
