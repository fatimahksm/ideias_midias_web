import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import SiteSettingsForm from '@/features/site-settings/components/site-settings-form';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function SiteSettingsPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('SiteSettingsPage');

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-6 py-8 text-[var(--color-text)]">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader title={t('title')} description={t('subtitle')} />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SiteSettingsForm />
        </div>
      </div>
    </main>
  );
}