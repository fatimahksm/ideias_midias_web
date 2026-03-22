import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import ThemeSettingsForm from '@/features/theme/components/theme-settings-form';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function ThemeSettingsPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('ThemeSettingsPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ThemeSettingsForm />
      </div>
    </section>
  );
}