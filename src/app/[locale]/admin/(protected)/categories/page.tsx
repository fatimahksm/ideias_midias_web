import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import CategoriesManager from '@/features/categories/components/categories-manager';

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{sectionId?: string}>;
};

export default async function CategoriesPage({params, searchParams}: Props) {
  const {locale} = await params;
  const query = await searchParams;

  setRequestLocale(locale);

  const t = await getTranslations('CategoriesPage');

  const parsedSectionId = query.sectionId ? Number(query.sectionId) : undefined;
  const sectionId =
    parsedSectionId && Number.isFinite(parsedSectionId) && parsedSectionId > 0
      ? parsedSectionId
      : undefined;

  return (
    <section className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <CategoriesManager sectionId={sectionId} />
    </section>
  );
}