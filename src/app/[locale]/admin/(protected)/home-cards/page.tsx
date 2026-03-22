import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import HomeCardsManager from '@/features/home-cards/components/home-cards-manager';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function HomeCardsPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('HomeCardsPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <HomeCardsManager />
    </section>
  );
}