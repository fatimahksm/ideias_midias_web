import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import AdminUserForm from '@/features/admin-users/components/admin-user-form';

type Props = {
  params: Promise<{locale: string; id: string}>;
};

export default async function EditAdminUserPage({params}: Props) {
  const {locale, id} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('AdminUserFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('editTitle')} description={t('editSubtitle')} />
      <AdminUserForm mode="edit" adminId={Number(id)} />
    </section>
  );
}
