import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import PortfolioProjectMediaForm from '@/features/portfolio-project-media/components/portfolio-project-media-form';

type Props = {
  params: Promise<{locale: string; id: string; mediaId: string}>;
};

export default async function EditPortfolioProjectMediaPage({params}: Props) {
  const {locale, id, mediaId} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('PortfolioProjectMediaFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('editTitle')} description={t('editSubtitle')} />
      <PortfolioProjectMediaForm
        mode="edit"
        projectId={Number(id)}
        mediaId={Number(mediaId)}
      />
    </section>
  );
}