import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import HomeCardForm from '@/features/home-cards/components/home-card-form';

type Props = {
  params: Promise<{locale: string; id: string}>;
};

export default async function EditHomeCardPage({params}: Props) {
  const {locale, id} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('HomeCardFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('editTitle')} description={t('editSubtitle')} />
      <HomeCardForm mode="edit" cardId={Number(id)} />
    </section>
  );
}