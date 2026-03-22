import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import PortfolioProjectForm from '@/features/portfolio-projects/components/portfolio-project-form';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function CreatePortfolioProjectPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('PortfolioProjectFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('createTitle')} description={t('createSubtitle')} />
      <PortfolioProjectForm mode="create" />
    </section>
  );
}