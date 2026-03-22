import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import MediaLibraryManager from '@/features/media-library/components/media-library-manager';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function MediaLibraryPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('MediaLibraryPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <MediaLibraryManager />
    </section>
  );
}