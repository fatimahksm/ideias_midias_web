import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function AdminHomePage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('AdminDashboardPage');

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader title={t('title')} description={t('subtitle')} />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            Admin home is ready. Next step is wiring real modules.
          </p>
        </div>
      </div>
    </main>
  );
}