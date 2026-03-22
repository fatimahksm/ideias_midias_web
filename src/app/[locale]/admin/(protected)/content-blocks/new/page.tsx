import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import ContentBlockForm from '@/features/content-blocks/components/content-block-form';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function CreateContentBlockPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('ContentBlockFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('createTitle')} description={t('createSubtitle')} />
      <ContentBlockForm mode="create" />
    </section>
  );
}