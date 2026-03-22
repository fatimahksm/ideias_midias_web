import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import PortfolioProjectForm from '@/features/portfolio-projects/components/portfolio-project-form';

type Props = {
  params: Promise<{locale: string; id: string}>;
};

export default async function EditPortfolioProjectPage({params}: Props) {
  const {locale, id} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('PortfolioProjectFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('editTitle')} description={t('editSubtitle')} />
      <PortfolioProjectForm mode="edit" projectId={Number(id)} />
    </section>
  );
}