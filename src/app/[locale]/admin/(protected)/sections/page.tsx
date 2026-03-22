import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import SectionsManager from '@/features/sections/components/sections-manager';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function SectionsPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('SectionsPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <SectionsManager />
    </section>
  );
}