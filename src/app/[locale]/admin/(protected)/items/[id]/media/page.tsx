import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import ItemMediaManager from '@/features/item-media/components/item-media-manager';

type Props = {
  params: Promise<{locale: string; id: string}>;
};

export default async function ItemMediaPage({params}: Props) {
  const {locale, id} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('ItemMediaPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <ItemMediaManager itemId={Number(id)} />
    </section>
  );
}