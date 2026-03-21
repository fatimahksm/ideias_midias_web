import {getTranslations, setRequestLocale} from 'next-intl/server';
import LanguageSwitcher from '@/components/common/language-switcher';
import LoginForm from '@/features/auth/components/login-form';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function AdminLoginPage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('AdminLoginPage');

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-[var(--color-text)]">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
          <p className="mb-6 text-slate-600">{t('subtitle')}</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}