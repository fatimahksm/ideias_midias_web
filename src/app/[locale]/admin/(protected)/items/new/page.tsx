import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import ItemForm from '@/features/items/components/item-form';

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{sectionId?: string; categoryId?: string}>;
};

export default async function CreateItemPage({params, searchParams}: Props) {
  const {locale} = await params;
  const query = await searchParams;

  setRequestLocale(locale);

  const t = await getTranslations('ItemFormPage');

  const parsedSectionId = query.sectionId ? Number(query.sectionId) : undefined;
  const initialSectionId =
    parsedSectionId && Number.isFinite(parsedSectionId) && parsedSectionId > 0
      ? parsedSectionId
      : undefined;

  const parsedCategoryId = query.categoryId ? Number(query.categoryId) : undefined;
  const initialCategoryId =
    parsedCategoryId && Number.isFinite(parsedCategoryId) && parsedCategoryId > 0
      ? parsedCategoryId
      : undefined;

  return (
    <section className="space-y-6">
      <PageHeader title={t('createTitle')} description={t('createSubtitle')} />
      <ItemForm
        mode="create"
        initialSectionId={initialSectionId}
        initialCategoryId={initialCategoryId}
      />
    </section>
  );
}