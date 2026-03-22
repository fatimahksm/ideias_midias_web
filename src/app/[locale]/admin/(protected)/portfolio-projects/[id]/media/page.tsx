import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import PortfolioProjectMediaManager from '@/features/portfolio-project-media/components/portfolio-project-media-manager';

type Props = {
  params: Promise<{locale: string; id: string}>;
};

export default async function PortfolioProjectMediaPage({params}: Props) {
  const {locale, id} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('PortfolioProjectMediaPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <PortfolioProjectMediaManager projectId={Number(id)} />
    </section>
  );
}