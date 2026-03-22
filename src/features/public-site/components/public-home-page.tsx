'use client';

import Image from 'next/image';
import {motion} from 'framer-motion';
import {useTranslations} from 'next-intl';
import {
  ArrowDown,
  ArrowUpRight,
  Globe,
  Mail,
  MapPinned,
  MessageCircle,
  Phone,
  Play
} from 'lucide-react';
import LanguageSwitcher from '@/components/common/language-switcher';
import {Link} from '@/i18n/navigation';
import {getContactHref} from '@/features/contact-methods/utils';
import type {ContactMethodResponse} from '@/features/contact-methods/types';
import type {PublicHomeData} from '../types';
import {
  buildMapsUrl,
  getLocalizedValue,
  isEmbeddableVideoUrl
} from '../utils';
import {resolveMediaUrl} from '@/lib/media/resolve-media-url';

type Props = {
  locale: string;
  data: PublicHomeData;
};

function getContactIcon(type: ContactMethodResponse['type']) {
  switch (type) {
    case 'PHONE':
      return <Phone className="h-5 w-5" />;
    case 'WHATSAPP':
      return <MessageCircle className="h-5 w-5" />;
    case 'EMAIL':
      return <Mail className="h-5 w-5" />;
    default:
      return <Globe className="h-5 w-5" />;
  }
}

const fadeUp = {
  hidden: {opacity: 0, y: 28},
  visible: {opacity: 1, y: 0}
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

export default function PublicHomePage({locale, data}: Props) {
  const t = useTranslations('PublicSite');

  const site = data.siteSettings;

  const companyName =
    getLocalizedValue(locale, site?.companyNamePt, site?.companyNameEn) ||
    'Ideias Midias';

  const intro =
    getLocalizedValue(locale, site?.shortIntroPt, site?.shortIntroEn) || '';

  const heroTitle =
    getLocalizedValue(locale, site?.heroTitlePt, site?.heroTitleEn) ||
    companyName;

  const heroSubtitle =
    getLocalizedValue(locale, site?.heroSubtitlePt, site?.heroSubtitleEn) ||
    intro;

  const address = getLocalizedValue(locale, site?.addressPt, site?.addressEn);

  const mapsUrl = buildMapsUrl(locale, {
    locationLat: site?.locationLat,
    locationLng: site?.locationLng,
    addressPt: site?.addressPt,
    addressEn: site?.addressEn
  });

  const whatsappMethod = data.contactMethods.find(
    (item) => item.type === 'WHATSAPP'
  );

  const whatsappHref = whatsappMethod
    ? getContactHref(whatsappMethod.type, whatsappMethod.value)
    : null;

  const heroBackgroundUrl = resolveMediaUrl(site?.heroBackgroundUrl);
  const heroBackgroundType = site?.heroBackgroundType || 'IMAGE';
  const logoUrl = resolveMediaUrl(site?.logoUrl);
  const companyVideoUrl = resolveMediaUrl(site?.companyVideoUrl);
  const mapEmbedUrl = site?.mapEmbedUrl?.trim() || '';

  return (
    <main className="overflow-x-hidden bg-[var(--color-background)] text-[var(--color-text)]">
      <section className="relative isolate min-h-screen overflow-hidden">
        {heroBackgroundUrl ? (
          heroBackgroundType === 'VIDEO' ? (
            <motion.video
              initial={{scale: 1.08}}
              animate={{scale: 1}}
              transition={{duration: 1.8, ease: 'easeOut'}}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src={heroBackgroundUrl} />
            </motion.video>
          ) : (
            <motion.div
              initial={{scale: 1.08}}
              animate={{scale: 1}}
              transition={{duration: 1.8, ease: 'easeOut'}}
              className="absolute inset-0"
            >
              <Image
                src={heroBackgroundUrl}
                alt={companyName}
                fill
                priority
                className="object-cover"
              />
            </motion.div>
          )
        ) : (
          <div className="absolute inset-0 bg-[var(--color-secondary)]" />
        )}

        <div
          className="absolute inset-0"
          style={{backgroundColor: 'var(--color-hero-overlay)'}}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/70" />
        <div className="absolute left-1/2 top-[-120px] h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 md:px-8">
          <motion.div
            initial={{opacity: 0, y: -18}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.6}}
            className="flex justify-end"
          >
            <div className="rounded-2xl border border-white/15 bg-white/10 p-2 shadow-lg backdrop-blur-md">
              <LanguageSwitcher />
            </div>
          </motion.div>

          <div className="flex flex-1 items-center">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mx-auto max-w-5xl text-center text-white"
            >
              {logoUrl ? (
                <motion.div
                  variants={fadeUp}
                  transition={{duration: 0.7}}
                  className="mb-8 flex justify-center"
                >
                  <div className="relative h-28 w-28 overflow-hidden rounded-full border border-white/25 bg-white/10 shadow-2xl backdrop-blur-xl md:h-32 md:w-32">
                    <Image
                      src={logoUrl}
                      alt={companyName}
                      fill
                      className="object-contain p-3"
                    />
                  </div>
                </motion.div>
              ) : null}

              <motion.div
                variants={fadeUp}
                transition={{duration: 0.7}}
                className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/85 backdrop-blur-md"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {companyName}
              </motion.div>

              <motion.h1
                variants={fadeUp}
                transition={{duration: 0.8}}
                className="text-5xl font-black tracking-[-0.04em] md:text-7xl xl:text-8xl"
              >
                {heroTitle}
              </motion.h1>

              {heroSubtitle ? (
                <motion.p
                  variants={fadeUp}
                  transition={{duration: 0.85}}
                  className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/85 md:text-xl md:leading-9"
                >
                  {heroSubtitle}
                </motion.p>
              ) : null}

              <motion.div
                variants={fadeUp}
                transition={{duration: 0.9}}
                className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <a
                  href="#home-sections"
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-white px-7 py-3 text-base font-semibold text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  {t('exploreSections')}
                </a>

                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-7 py-3 text-base font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
                  >
                    {t('contactUs')}
                  </a>
                ) : null}
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{opacity: 0, y: 16}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8, delay: 0.8}}
            className="flex justify-center pb-4"
          >
            <a
              href="#home-sections"
              aria-label={t('exploreSections')}
              className="inline-flex h-14 w-14 animate-bounce items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition hover:bg-white/15"
            >
              <ArrowDown className="h-5 w-5" />
            </a>
          </motion.div>
        </div>
      </section>

      <section id="home-sections" className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/60 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <motion.div
            initial={{opacity: 0, y: 24}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.2}}
            transition={{duration: 0.7}}
            className="mx-auto mb-14 max-w-3xl text-center"
          >
            <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t('quickLinks')}
            </span>

            <h2 className="mt-5 text-4xl font-black tracking-[-0.03em] text-slate-950 md:text-6xl">
              {t('exploreSections')}
            </h2>

            <p className="mt-4 text-lg leading-8 text-slate-600 md:text-xl">
              {t('exploreSectionsDescription')}
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{once: true, amount: 0.12}}
            className="grid gap-8 md:grid-cols-2 xl:grid-cols-3"
          >
            {data.homeCards.map((card) => {
              const title =
                getLocalizedValue(locale, card.titlePt, card.titleEn) ||
                t('untitled');

              const description =
                getLocalizedValue(
                  locale,
                  card.shortDescriptionPt,
                  card.shortDescriptionEn
                ) || '';

              const href = card.sectionSlug
                ? `/sections/${card.sectionSlug}`
                : '/';

              const cardImageUrl = resolveMediaUrl(card.imageUrl);

              return (
                <motion.div
                  key={card.id}
                  variants={fadeUp}
                  transition={{duration: 0.6}}
                >
                  <Link
                    href={href}
                    className="group block overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(15,23,42,0.14)]"
                  >
                    <div className="relative h-72 overflow-hidden bg-slate-200">
                      {cardImageUrl ? (
                        <>
                          <Image
                            src={cardImageUrl}
                            alt={title}
                            fill
                            className="object-cover transition duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-90" />
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center bg-slate-200 text-slate-500">
                          {t('noImage')}
                        </div>
                      )}

                      <div className="absolute right-5 top-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white shadow-lg backdrop-blur-md transition duration-300 group-hover:rotate-45 group-hover:bg-white/20">
                        <ArrowUpRight className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="space-y-4 p-7">
                      <h3 className="text-3xl font-black tracking-[-0.03em] text-slate-950 transition group-hover:text-slate-800">
                        {title}
                      </h3>

                      {description ? (
                        <p className="line-clamp-3 text-base leading-8 text-slate-600">
                          {description}
                        </p>
                      ) : null}

                      <div className="pt-2">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {t('exploreSections')}
                          <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {companyVideoUrl ? (
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <motion.div
              initial={{opacity: 0, y: 24}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.2}}
              transition={{duration: 0.7}}
              className="mx-auto max-w-3xl text-center"
            >
              <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                {t('companyStory')}
              </span>

              <h2 className="mt-5 text-4xl font-black tracking-[-0.03em] text-slate-950 md:text-6xl">
                {t('companyStory')}
              </h2>

              <p className="mt-4 text-lg leading-8 text-slate-600 md:text-xl">
                {t('companyStoryDescription')}
              </p>
            </motion.div>

            <motion.div
              initial={{opacity: 0, y: 28}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.18}}
              transition={{duration: 0.8}}
              className="mx-auto mt-12 max-w-6xl overflow-hidden rounded-[34px] border border-slate-200 bg-black shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
            >
              <div className="flex items-center gap-3 border-b border-white/10 bg-slate-950 px-5 py-4 text-white/70">
                <div className="flex gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="ml-auto flex items-center gap-2 text-sm">
                  <Play className="h-4 w-4" />
                  {t('companyStory')}
                </div>
              </div>

              <div className="aspect-video w-full">
                {isEmbeddableVideoUrl(companyVideoUrl) ? (
                  <iframe
                    src={companyVideoUrl}
                    title={t('companyStory')}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <video
                    className="h-full w-full"
                    controls
                    playsInline
                    preload="metadata"
                  >
                    <source src={companyVideoUrl} />
                  </video>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      ) : null}

      <section className="relative overflow-hidden bg-[var(--color-secondary)] py-20 text-white md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <motion.div
            initial={{opacity: 0, y: 24}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.18}}
            transition={{duration: 0.7}}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              {t('contactUs')}
            </span>

            <h2 className="mt-5 text-4xl font-black tracking-[-0.03em] md:text-6xl">
              {t('contactUs')}
            </h2>

            <p className="mt-4 text-lg leading-8 text-white/70 md:text-xl">
              {t('contactDescription')}
            </p>
          </motion.div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{once: true, amount: 0.15}}
              className="space-y-5"
            >
              {data.contactMethods.map((item) => {
                const href = getContactHref(item.type, item.value);
                const label =
                  getLocalizedValue(locale, item.labelPt, item.labelEn) ||
                  item.type;

                return (
                  <motion.div
                    key={item.id}
                    variants={fadeUp}
                    transition={{duration: 0.55}}
                    className="group rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition duration-300 hover:border-white/20 hover:bg-white/10"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-lg transition duration-300 group-hover:scale-105">
                        {getContactIcon(item.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-bold text-white">{label}</p>

                        {href ? (
                          <a
                            href={href}
                            target={item.type === 'SOCIAL' ? '_blank' : undefined}
                            rel={item.type === 'SOCIAL' ? 'noreferrer' : undefined}
                            className="mt-2 block break-all text-base leading-7 text-white/70 transition hover:text-white"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="mt-2 break-all text-base leading-7 text-white/70">
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {whatsappHref ? (
                <motion.a
                  variants={fadeUp}
                  transition={{duration: 0.55}}
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-emerald-500 px-6 text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-xl"
                >
                  {t('contactUs')}
                </motion.a>
              ) : null}
            </motion.div>

            <motion.div
              initial={{opacity: 0, y: 28}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.15}}
              transition={{duration: 0.75}}
              className="overflow-hidden rounded-[32px] border border-white/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]"
            >
              {mapEmbedUrl ? (
                <div className="relative">
                  <iframe
                    src={mapEmbedUrl}
                    title={t('location')}
                    className="h-[520px] w-full"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />

                  {mapsUrl ? (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
                      <div className="pointer-events-auto inline-flex rounded-2xl bg-slate-950/90 p-2 shadow-xl backdrop-blur-md">
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                        >
                          {t('openInMaps')}
                        </a>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex h-[520px] flex-col items-center justify-center gap-5 bg-slate-50 p-8 text-center text-slate-700">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                    <MapPinned className="h-7 w-7" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-slate-950">
                      {t('location')}
                    </h3>
                    <p className="mx-auto max-w-md text-base leading-7 text-slate-600">
                      {address || t('locationNotAvailable')}
                    </p>
                  </div>

                  {mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-2xl bg-[var(--color-accent)] px-5 py-3 font-semibold text-white transition hover:opacity-90"
                    >
                      {t('openInMaps')}
                    </a>
                  ) : null}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
          <div className="grid gap-12 md:grid-cols-3">
            <motion.div
              initial={{opacity: 0, y: 18}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.2}}
              transition={{duration: 0.6}}
              className="space-y-5"
            >
              {logoUrl ? (
                <div className="relative h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-slate-50 shadow-sm">
                  <Image
                    src={logoUrl}
                    alt={companyName}
                    fill
                    className="object-contain p-2"
                  />
                </div>
              ) : null}

              <div>
                <h3 className="text-3xl font-black tracking-[-0.03em] text-slate-950">
                  {companyName}
                </h3>
                {intro ? (
                  <p className="mt-4 max-w-md text-base leading-8 text-slate-600">
                    {intro}
                  </p>
                ) : null}
              </div>
            </motion.div>

            <motion.div
              initial={{opacity: 0, y: 18}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.2}}
              transition={{duration: 0.65}}
            >
              <h4 className="text-xl font-black text-slate-950">
                {t('quickLinks')}
              </h4>

              <div className="mt-5 space-y-3">
                {data.homeCards.slice(0, 5).map((card) => {
                  const title =
                    getLocalizedValue(locale, card.titlePt, card.titleEn) ||
                    t('untitled');

                  return card.sectionSlug ? (
                    <Link
                      key={card.id}
                      href={`/sections/${card.sectionSlug}`}
                      className="group inline-flex items-center gap-2 text-base text-slate-600 transition hover:text-slate-950"
                    >
                      <span>{title}</span>
                      <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  ) : (
                    <p key={card.id} className="text-base text-slate-500">
                      {title}
                    </p>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{opacity: 0, y: 18}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.2}}
              transition={{duration: 0.7}}
            >
              <h4 className="text-xl font-black text-slate-950">
                {t('contactUs')}
              </h4>

              <div className="mt-5 space-y-3 text-base text-slate-600">
                {data.contactMethods.slice(0, 3).map((item) => {
                  const href = getContactHref(item.type, item.value);

                  return href ? (
                    <a
                      key={item.id}
                      href={href}
                      target={item.type === 'SOCIAL' ? '_blank' : undefined}
                      rel={item.type === 'SOCIAL' ? 'noreferrer' : undefined}
                      className="block break-all transition hover:text-slate-950"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p key={item.id} className="break-all">
                      {item.value}
                    </p>
                  );
                })}

                {address ? <p>{address}</p> : null}
              </div>
            </motion.div>
          </div>
        </div>
      </footer>
    </main>
  );
}