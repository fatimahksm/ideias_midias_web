import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import SectionForm from '@/features/sections/components/section-form';

type Props = {
  params: Promise<{locale: string; id: string}>;
};

export default async function EditSectionPage({params}: Props) {
  const {locale, id} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('SectionFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('editTitle')} description={t('editSubtitle')} />
      <SectionForm mode="edit" sectionId={Number(id)} />
    </section>
  );
}