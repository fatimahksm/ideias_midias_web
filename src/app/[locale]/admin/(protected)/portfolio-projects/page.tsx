import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import PortfolioProjectsManager from '@/features/portfolio-projects/components/portfolio-projects-manager';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function PortfolioProjectsPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('PortfolioProjectsPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <PortfolioProjectsManager />
    </section>
  );
}