import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {PageHeader} from '@/components/common/page-header';
import {SettingsCard} from '@/components/common/settings-card';

type Props = {
  params: Promise<{locale: string}>;
};

const actionLinkClass =
  'inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90';

export default async function AdminHomePage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('AdminDashboardPage');

  return (
    <section className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />

      <div className="grid gap-6 xl:grid-cols-2">
        <SettingsCard
          title={t('siteSettingsCardTitle')}
          description={t('siteSettingsCardDescription')}
        >
          <Link href="/admin/site-settings" className={actionLinkClass}>
            {t('siteSettingsCardAction')}
          </Link>
        </SettingsCard>

        <SettingsCard
          title={t('homeCardsCardTitle')}
          description={t('homeCardsCardDescription')}
        >
          <Link href="/admin/home-cards" className={actionLinkClass}>
            {t('homeCardsCardAction')}
          </Link>
        </SettingsCard>

        <SettingsCard
          title={t('sectionsCardTitle')}
          description={t('sectionsCardDescription')}
        >
          <Link href="/admin/sections" className={actionLinkClass}>
            {t('sectionsCardAction')}
          </Link>
        </SettingsCard>

        <SettingsCard
          title={t('mediaCardTitle')}
          description={t('mediaCardDescription')}
        >
          <Link href="/admin/media" className={actionLinkClass}>
            {t('mediaCardAction')}
          </Link>
        </SettingsCard>

        <SettingsCard
          title={t('contactMethodsCardTitle')}
          description={t('contactMethodsCardDescription')}
        >
          <Link href="/admin/contact-methods" className={actionLinkClass}>
            {t('contactMethodsCardAction')}
          </Link>
        </SettingsCard>

        <SettingsCard
          title={t('themeSettingsCardTitle')}
          description={t('themeSettingsCardDescription')}
        >
          <Link href="/admin/theme-settings" className={actionLinkClass}>
            {t('themeSettingsCardAction')}
          </Link>
        </SettingsCard>
      </div>
    </section>
  );
}