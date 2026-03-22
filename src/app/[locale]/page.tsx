import {setRequestLocale} from 'next-intl/server';
import PublicHomePage from '@/features/public-site/components/public-home-page';
import {getPublicHomeData} from '@/features/public-site/api';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function HomePage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const data = await getPublicHomeData();

  return <PublicHomePage locale={locale} data={data} />;
}