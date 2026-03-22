import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import CategoriesManager from '@/features/categories/components/categories-manager';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function CategoriesPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('CategoriesPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <CategoriesManager />
    </section>
  );
}