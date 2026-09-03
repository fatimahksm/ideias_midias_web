import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('NotFoundPage');

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{
        background: 'var(--color-background)',
        color: 'var(--color-text)'
      }}
    >
      <p
        className="text-sm font-bold tracking-[0.3em] uppercase"
        style={{color: 'var(--color-primary)'}}
      >
        404
      </p>
      <h1 className="mt-4 text-3xl font-black md:text-4xl">{t('title')}</h1>
      <p className="mt-3 max-w-md text-base text-slate-500">
        {t('description')}
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-medium text-white transition hover:opacity-90"
        style={{background: 'var(--color-primary)'}}
      >
        {t('backHome')}
      </Link>
    </div>
  );
}
