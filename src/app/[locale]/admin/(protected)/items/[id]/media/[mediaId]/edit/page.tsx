import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import ItemMediaForm from '@/features/item-media/components/item-media-form';

type Props = {
  params: Promise<{locale: string; id: string; mediaId: string}>;
};

export default async function EditItemMediaPage({params}: Props) {
  const {locale, id, mediaId} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('ItemMediaFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('editTitle')} description={t('editSubtitle')} />
      <ItemMediaForm
        mode="edit"
        itemId={Number(id)}
        mediaId={Number(mediaId)}
      />
    </section>
  );
}