import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import ItemForm from '@/features/items/components/item-form';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function CreateItemPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('ItemFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('createTitle')} description={t('createSubtitle')} />
      <ItemForm mode="create" />
    </section>
  );
}