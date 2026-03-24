import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import CategoryForm from '@/features/categories/components/category-form';

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{sectionId?: string}>;
};

export default async function CreateCategoryPage({params, searchParams}: Props) {
  const {locale} = await params;
  const query = await searchParams;

  setRequestLocale(locale);

  const t = await getTranslations('CategoryFormPage');

  const parsedSectionId = query.sectionId ? Number(query.sectionId) : undefined;
  const initialSectionId =
    parsedSectionId && Number.isFinite(parsedSectionId) && parsedSectionId > 0
      ? parsedSectionId
      : undefined;

  return (
    <section className="space-y-6">
      <PageHeader title={t('createTitle')} description={t('createSubtitle')} />
      <CategoryForm mode="create" initialSectionId={initialSectionId} />
    </section>
  );
}