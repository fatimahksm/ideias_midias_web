import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import {SectionWorkspace} from '@/features/sections/components/section-workspace';

type Props = {
  params: Promise<{locale: string; id: string}>;
};

export default async function SectionWorkspacePage({params}: Props) {
  const {locale, id} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('SectionWorkspacePage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <SectionWorkspace sectionId={Number(id)} />
    </section>
  );
}