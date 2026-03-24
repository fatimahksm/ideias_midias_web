import {getTranslations} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import {AdminDashboardOverview} from '@/features/admin-layout/components/admin-dashboard-overview';

export default async function AdminDashboardPage() {
  const t = await getTranslations('AdminDashboardPage');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      <AdminDashboardOverview />
    </div>
  );
}