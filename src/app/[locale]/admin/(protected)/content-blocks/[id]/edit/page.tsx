import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import ContentBlockForm from '@/features/content-blocks/components/content-block-form';

type Props = {
  params: Promise<{locale: string; id: string}>;
};

export default async function EditContentBlockPage({params}: Props) {
  const {locale, id} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('ContentBlockFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('editTitle')} description={t('editSubtitle')} />
      <ContentBlockForm mode="edit" blockId={Number(id)} />
    </section>
  );
}