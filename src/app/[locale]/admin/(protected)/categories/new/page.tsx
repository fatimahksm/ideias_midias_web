import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import CategoryForm from '@/features/categories/components/category-form';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function CreateCategoryPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('CategoryFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('createTitle')} description={t('createSubtitle')} />
      <CategoryForm mode="create" />
    </section>
  );
}