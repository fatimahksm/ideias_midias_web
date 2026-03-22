import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import SectionForm from '@/features/sections/components/section-form';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function CreateSectionPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('SectionFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('createTitle')} description={t('createSubtitle')} />
      <SectionForm mode="create" />
    </section>
  );
}