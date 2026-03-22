import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import ContactMethodForm from '@/features/contact-methods/components/contact-method-form';

type Props = {
  params: Promise<{locale: string; id: string}>;
};

export default async function EditContactMethodPage({params}: Props) {
  const {locale, id} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('ContactMethodFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('editTitle')} description={t('editSubtitle')} />
      <ContactMethodForm mode="edit" methodId={Number(id)} />
    </section>
  );
}