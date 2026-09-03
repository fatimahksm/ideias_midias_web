import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import DataImportManager from '@/features/data-import/components/data-import-manager';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function DataImportPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('DataImportPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <DataImportManager />
    </section>
  );
}
