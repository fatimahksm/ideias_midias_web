import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import HomeCardForm from '@/features/home-cards/components/home-card-form';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function CreateHomeCardPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('HomeCardFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('createTitle')} description={t('createSubtitle')} />
      <HomeCardForm mode="create" />
    </section>
  );
}