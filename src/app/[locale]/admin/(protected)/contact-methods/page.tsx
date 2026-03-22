import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHeader} from '@/components/common/page-header';
import ContactMethodsManager from '@/features/contact-methods/components/contact-methods-manager';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function ContactMethodsPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('ContactMethodsPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <ContactMethodsManager />
    </section>
  );
}