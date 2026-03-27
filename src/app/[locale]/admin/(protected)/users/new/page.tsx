import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import AdminUserForm from '@/features/admin-users/components/admin-user-form';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function CreateAdminUserPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('AdminUserFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('createTitle')} description={t('createSubtitle')} />
      <AdminUserForm mode="create" />
    </section>
  );
}
