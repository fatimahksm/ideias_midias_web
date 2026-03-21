import {getTranslations, setRequestLocale} from 'next-intl/server';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function HomePage({params}: Props) {
  const {locale} = await params;

  setRequestLocale(locale);

  const t = await getTranslations('HomePage');

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-bold md:text-5xl">
          {t('title')}
        </h1>

        <p className="max-w-2xl text-lg text-slate-600">
          {t('subtitle')}
        </p>

        <a
          href={`/${locale}/admin/login`}
          className="rounded-xl bg-slate-900 px-5 py-3 text-white transition hover:opacity-90"
        >
          {t('adminLogin')}
        </a>
      </section>
    </main>
  );
}