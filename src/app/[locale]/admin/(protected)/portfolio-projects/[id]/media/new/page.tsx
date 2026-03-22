import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import PortfolioProjectMediaForm from '@/features/portfolio-project-media/components/portfolio-project-media-form';

type Props = {
  params: Promise<{locale: string; id: string}>;
};

export default async function CreatePortfolioProjectMediaPage({params}: Props) {
  const {locale, id} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('PortfolioProjectMediaFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('createTitle')} description={t('createSubtitle')} />
      <PortfolioProjectMediaForm mode="create" projectId={Number(id)} />
    </section>
  );
}