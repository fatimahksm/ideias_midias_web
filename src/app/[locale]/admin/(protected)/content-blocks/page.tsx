import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import ContentBlocksManager from '@/features/content-blocks/components/content-blocks-manager';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function ContentBlocksPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('ContentBlocksPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <ContentBlocksManager />
    </section>
  );
}