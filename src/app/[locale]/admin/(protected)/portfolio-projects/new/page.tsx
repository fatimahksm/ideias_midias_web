import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import PortfolioProjectForm from '@/features/portfolio-projects/components/portfolio-project-form';

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{sectionId?: string}>;
};

export default async function CreatePortfolioProjectPage({
  params,
  searchParams
}: Props) {
  const {locale} = await params;
  const query = await searchParams;

  setRequestLocale(locale);

  const t = await getTranslations('PortfolioProjectFormPage');

  const parsedSectionId = query.sectionId ? Number(query.sectionId) : undefined;
  const initialSectionId =
    parsedSectionId && Number.isFinite(parsedSectionId) && parsedSectionId > 0
      ? parsedSectionId
      : undefined;

  return (
    <section className="space-y-6">
      <PageHeader title={t('createTitle')} description={t('createSubtitle')} />
      <PortfolioProjectForm mode="create" initialSectionId={initialSectionId} />
    </section>
  );
}