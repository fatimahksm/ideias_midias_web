import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import ContactMethodForm from '@/features/contact-methods/components/contact-method-form';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function CreateContactMethodPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('ContactMethodFormPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('createTitle')} description={t('createSubtitle')} />
      <ContactMethodForm mode="create" />
    </section>
  );
}