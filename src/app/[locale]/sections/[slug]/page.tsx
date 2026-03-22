import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import PublicSectionPage from '@/features/public-site/components/public-section-page';
import {getPublicSectionPageData} from '@/features/public-site/api';

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export default async function SectionDetailsPage({params}: Props) {
  const {locale, slug} = await params;

  setRequestLocale(locale);

  const data = await getPublicSectionPageData(slug);

  if (!data) {
    notFound();
  }

  return <PublicSectionPage locale={locale} data={data} />;
}