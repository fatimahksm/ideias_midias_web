import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import ItemsManager from '@/features/items/components/items-manager';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function ItemsPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('ItemsPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <ItemsManager />
    </section>
  );
}