import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import ItemForm from '@/features/items/components/item-form';

type Props = {
  params: Promise<{locale: string; id: string}>;
};

export default async function EditItemPage({params}: Props) {
  const {locale, id} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('ItemFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('editTitle')} description={t('editSubtitle')} />
      <ItemForm mode="edit" itemId={Number(id)} />
    </section>
  );
}