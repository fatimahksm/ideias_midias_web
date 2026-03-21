'use client';

import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';

export default function LanguageSwitcher() {
  const t = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    router.replace(pathname, {locale: nextLocale});
  }

  return (
    <div className="inline-flex items-center gap-2">
      <label
        htmlFor="language-switcher"
        className="text-sm font-medium text-[var(--color-text)]"
      >
        {t('language')}
      </label>

      <select
        id="language-switcher"
        value={locale}
        onChange={handleChange}
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-accent)]/10"
      >
        <option value="en">{t('english')}</option>
        <option value="pt">{t('portuguese')}</option>
      </select>
    </div>
  );
}