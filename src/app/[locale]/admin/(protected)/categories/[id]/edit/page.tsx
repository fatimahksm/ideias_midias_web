import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import CategoryForm from '@/features/categories/components/category-form';

type Props = {
  params: Promise<{locale: string; id: string}>;
};

export default async function EditCategoryPage({params}: Props) {
  const {locale, id} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('CategoryFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('editTitle')} description={t('editSubtitle')} />
      <CategoryForm mode="edit" categoryId={Number(id)} />
    </section>
  );
}