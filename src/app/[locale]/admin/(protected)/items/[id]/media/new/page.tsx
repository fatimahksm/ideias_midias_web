import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import ItemMediaForm from '@/features/item-media/components/item-media-form';

type Props = {
  params: Promise<{locale: string; id: string}>;
};

export default async function CreateItemMediaPage({params}: Props) {
  const {locale, id} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('ItemMediaFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('createTitle')} description={t('createSubtitle')} />
      <ItemMediaForm mode="create" itemId={Number(id)} />
    </section>
  );
}