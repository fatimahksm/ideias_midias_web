import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import ContentBlockForm from '@/features/content-blocks/components/content-block-form';

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{sectionId?: string}>;
};

export default async function CreateContentBlockPage({
  params,
  searchParams
}: Props) {
  const {locale} = await params;
  const query = await searchParams;

  setRequestLocale(locale);

  const t = await getTranslations('ContentBlockFormPage');

  const parsedSectionId = query.sectionId ? Number(query.sectionId) : undefined;
  const initialSectionId =
    parsedSectionId && Number.isFinite(parsedSectionId) && parsedSectionId > 0
      ? parsedSectionId
      : undefined;

  return (
    <section className="space-y-6">
      <PageHeader title={t('createTitle')} description={t('createSubtitle')} />
      <ContentBlockForm mode="create" initialSectionId={initialSectionId} />
    </section>
  );
}