'use client';

import Image from 'next/image';
import {motion} from 'framer-motion';
import {useTranslations} from 'next-intl';
import {
  ArrowDown,
  ArrowUpRight,
  ExternalLink,
  MapPin,
  Play
} from 'lucide-react';
import LanguageSwitcher from '@/components/common/language-switcher';
import {Link} from '@/i18n/navigation';
import {getContactHref} from '@/features/contact-methods/utils';
import type {PublicHomeData} from '../types';
import {
  buildMapsUrl,
  getLocalizedValue,
  isEmbeddableVideoUrl,
  toEmbeddableVideoUrl
} from '../utils';
import {
  PublicContactIcon,
  getPublicContactDisplayValue
} from '../contact-visuals';
import {resolveMediaUrl} from '@/lib/media/resolve-media-url';

type Props = {
  locale: string;
  data: PublicHomeData;
};

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

function hasMeaningfulText(value?: string | null) {
  return Boolean(value && value.trim().length > 0);
}



function normalizeMapEmbedUrl(url?: string | null) {
  if (!hasMeaningfulText(url)) return '';

  const value = url!.trim();

  if (value.includes('output=embed') || value.includes('/maps/embed')) {
    return value;
  }

  try {
    const parsed = new URL(value);

    if (
      parsed.hostname.includes('google.com') ||
      parsed.hostname.includes('maps.app.goo.gl')
    ) {
      const q =
        parsed.searchParams.get('q') ||
        parsed.searchParams.get('query') ||
        parsed.searchParams.get('destination');

      if (q) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`;
      }
    }
  } catch {
    return '';
  }

  return '';
}

function buildMapEmbedUrl({
  mapEmbedUrl,
  locationLat,
  locationLng,
  addressPt,
  addressEn
}: {
  mapEmbedUrl?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  addressPt?: string | null;
  addressEn?: string | null;
}) {
  const normalizedEmbedUrl = normalizeMapEmbedUrl(mapEmbedUrl);
  if (normalizedEmbedUrl) {
    return normalizedEmbedUrl;
  }

  if (
    typeof locationLat === 'number' &&
    !Number.isNaN(locationLat) &&
    typeof locationLng === 'number' &&
    !Number.isNaN(locationLng)
  ) {
    return `https://maps.google.com/maps?q=${locationLat},${locationLng}&z=15&output=embed`;
  }

  const address = addressEn || addressPt;

  if (hasMeaningfulText(address)) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(address!)}&z=15&output=embed`;
  }

  return '';
}
export default function PublicHomePage({locale, data}: Props) {
  const t = useTranslations('PublicSite');

  const site = data.siteSettings;

  const companyName =
    getLocalizedValue(locale, site?.companyNamePt, site?.companyNameEn) ||
    site?.companyNameEn ||
    site?.companyNamePt ||
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

  const mapEmbedUrl = buildMapEmbedUrl({
    mapEmbedUrl: site?.mapEmbedUrl,
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

  const primaryContactMethods = data.contactMethods.filter(
    (item) => item.type !== 'SOCIAL'
  );

  const socialContactMethods = data.contactMethods.filter(
    (item) => item.type === 'SOCIAL'
  );

  const footerQuickLinks = data.homeCards
    .filter((card) => card.sectionSlug)
    .slice(0, 5);

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
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/75" />
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
    <div className="flex h-[128px] w-[128px] items-center justify-center rounded-full border border-white/20 bg-white/12 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl md:h-[144px] md:w-[144px]">
      <div className="relative h-full w-full overflow-hidden rounded-full bg-[var(--color-surface)] shadow-inner">
        <Image
          src={logoUrl}
          alt={companyName}
          fill
          className="object-contain p-4 md:p-5"
          sizes="144px"
        />
      </div>
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
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[var(--color-surface)] px-7 py-3 text-base font-semibold text-[var(--color-text)] shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
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
            <span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              {t('quickLinks')}
            </span>

            <h2 className="mt-5 text-4xl font-black tracking-[-0.03em] text-[var(--color-text)] md:text-6xl">
              {t('exploreSections')}
            </h2>

            <p className="mt-4 text-lg leading-8 text-[var(--color-text-muted)] md:text-xl">
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
                    className="group block overflow-hidden rounded-[30px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_10px_35px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(15,23,42,0.14)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-surface-muted)]">
                      {cardImageUrl ? (
                        <>
                          <Image
                            src={cardImageUrl}
                            alt={title}
                            fill
                            className="object-cover transition duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent opacity-90" />
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
                          {t('noImage')}
                        </div>
                      )}

                      <div className="absolute right-5 top-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white shadow-lg backdrop-blur-md transition duration-300 group-hover:rotate-45 group-hover:bg-white/20">
                        <ArrowUpRight className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="space-y-4 p-7">
                      <h3 className="text-3xl font-black tracking-[-0.03em] text-[var(--color-text)] transition group-hover:opacity-85">
                        {title}
                      </h3>

                      {description ? (
                        <p className="line-clamp-3 text-base leading-8 text-[var(--color-text-muted)]">
                          {description}
                        </p>
                      ) : null}

                      <div className="pt-2">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
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
              <span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                {t('companyStory')}
              </span>

              <h2 className="mt-5 text-4xl font-black tracking-[-0.03em] text-[var(--color-text)] md:text-6xl">
                {t('companyStory')}
              </h2>

              <p className="mt-4 text-lg leading-8 text-[var(--color-text-muted)] md:text-xl">
                {t('companyStoryDescription')}
              </p>
            </motion.div>

            <motion.div
              initial={{opacity: 0, y: 28}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.18}}
              transition={{duration: 0.8}}
              className="mx-auto mt-12 max-w-6xl overflow-hidden rounded-[34px] border border-[var(--color-border)] bg-black shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
            >
              <div className="flex items-center gap-3 border-b border-white/10 bg-[var(--color-secondary)] px-5 py-4 text-white/70">
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
                    src={toEmbeddableVideoUrl(companyVideoUrl) ?? companyVideoUrl}
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

      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
        <motion.div  
            initial={{opacity: 0, y: 24}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.18}}
            transition={{duration: 0.7}}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              {t('contactUs')}
            </span>

            <h2 className="mt-5 text-4xl font-black tracking-[-0.03em] text-[var(--color-text)] md:text-6xl">
              {t('contactUs')}
            </h2>

            <p className="mt-4 text-lg leading-8 text-[var(--color-text-muted)] md:text-xl">
              {t('contactDescription')}
            </p>
          </motion.div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{once: true, amount: 0.15}}
              className="space-y-6"
            >
              {primaryContactMethods.length ? (
                <motion.div
                  variants={fadeUp}
                  transition={{duration: 0.55}}
                  className="rounded-[30px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm"
                >
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                      {t('primaryContacts')}
                    </p>

                    {mapsUrl ? (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]"
                      >
                        <MapPin className="h-4 w-4" />
                        {t('openInMaps')}
                      </a>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    {primaryContactMethods.map((item) => {
                      const href = getContactHref(item.type, item.value);
                      const label =
                        getLocalizedValue(locale, item.labelPt, item.labelEn) ||
                        getPublicContactDisplayValue(item);
                      const displayValue = getPublicContactDisplayValue(item);

                      return (
                        <div
                          key={item.id}
                          className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)]"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
                              <PublicContactIcon
                                type={item.type}
                                iconName={item.iconName}
                                className="h-5 w-5"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-black text-[var(--color-text)]">
                                {label}
                              </p>

                              {href ? (
                                <a
                                  href={href}
                                  target={item.type === 'SOCIAL' ? '_blank' : undefined}
                                  rel={item.type === 'SOCIAL' ? 'noreferrer' : undefined}
                                  className="mt-1 block break-words text-base leading-7 text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] [overflow-wrap:anywhere]"
                                >
                                  {displayValue}
                                </a>
                              ) : (
                                <p className="mt-1 break-words text-base leading-7 text-[var(--color-text-muted)] [overflow-wrap:anywhere]">
                                  {displayValue}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {whatsappHref ? (
                    <div className="mt-6">
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        className="theme-accent-button inline-flex min-h-14 w-full items-center justify-center rounded-2xl px-6 text-base font-semibold shadow-lg transition hover:-translate-y-0.5 hover:opacity-90 hover:shadow-xl"
                      >
                        {t('contactUs')}
                      </a>
                    </div>
                  ) : null}
                </motion.div>
              ) : null}

              {socialContactMethods.length ? (
                <motion.div
                  variants={fadeUp}
                  transition={{duration: 0.55}}
                  className="rounded-[30px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                    {t('followUs')}
                  </p>

                  <h3 className="mt-2 text-2xl font-black text-[var(--color-text)]">
                    {t('socialLinks')}
                  </h3>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {socialContactMethods.map((item) => {
                      const href = getContactHref(item.type, item.value);

                      if (!href) return null;

                      const label =
                        getLocalizedValue(locale, item.labelPt, item.labelEn) ||
                        getPublicContactDisplayValue(item);

                      return (
                        <a
                          key={item.id}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          title={label}
                          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]"
                        >
                          <PublicContactIcon
                            type={item.type}
                            iconName={item.iconName}
                            className="h-5 w-5"
                          />
                        </a>
                      );
                    })}
                  </div>
                </motion.div>
              ) : null}
            </motion.div>

            <motion.div
  initial={{opacity: 0, y: 28}}
  whileInView={{opacity: 1, y: 0}}
  viewport={{once: true, amount: 0.15}}
  transition={{duration: 0.75}}
>
  {mapEmbedUrl ? (
    <div className="overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
      <div className="relative">
        <iframe
          src={mapEmbedUrl}
          title={t('location')}
          className="h-[520px] w-full"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
          <div className="pointer-events-auto rounded-[24px] border border-white/20 bg-white/94 p-4 shadow-xl backdrop-blur-md md:max-w-md">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                <MapPin className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-[var(--color-text)]">
                  {t('location')}
                </p>

                {hasMeaningfulText(address) ? (
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
                    {address}
                  </p>
                ) : null}
              </div>
            </div>

            {mapsUrl ? (
              <div className="mt-4">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-secondary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('openInMaps')}
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
      <div className="flex h-[520px] flex-col justify-between bg-[var(--color-surface-muted)] p-8">
        <div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-lg">
            <MapPin className="h-7 w-7" />
          </div>

          <h3 className="mt-6 text-3xl font-black text-[var(--color-text)]">
            {t('location')}
          </h3>

          <p className="mt-3 max-w-md text-base leading-8 text-[var(--color-text-muted)]">
            {address || t('locationNotAvailable')}
          </p>
        </div>

        {mapsUrl ? (
          <div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="theme-accent-button inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold transition hover:opacity-90"
            >
              <ExternalLink className="h-4 w-4" />
              {t('openInMaps')}
            </a>
          </div>
        ) : null}
      </div>
    </div>
  )}
</motion.div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-6 py-14 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_1fr]">
            <motion.div
              initial={{opacity: 0, y: 18}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.2}}
              transition={{duration: 0.6}}
            >
              <div className="flex items-start gap-4">
                {logoUrl ? (
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[26px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-sm">
                    <Image
                      src={logoUrl}
                      alt={companyName}
                      fill
                      className="object-contain p-2"
                      sizes="80px"
                    />
                  </div>
                ) : null}

                <div className="min-w-0">
                  <h3 className="text-3xl font-black tracking-[-0.03em] text-[var(--color-text)]">
                    {companyName}
                  </h3>

                  {intro ? (
                    <p className="mt-3 max-w-md text-base leading-8 text-[var(--color-text-muted)]">
                      {intro}
                    </p>
                  ) : null}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{opacity: 0, y: 18}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.2}}
              transition={{duration: 0.65}}
            >
              <h4 className="text-xl font-black text-[var(--color-text)]">
                {t('quickLinks')}
              </h4>

              <div className="mt-5 space-y-3">
                {footerQuickLinks.map((card) => {
                  const title =
                    getLocalizedValue(locale, card.titlePt, card.titleEn) ||
                    t('untitled');

                  return (
                    <Link
                      key={card.id}
                      href={`/sections/${card.sectionSlug}`}
                      className="group flex items-center justify-between gap-3 rounded-2xl px-0 py-2 text-base text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
                    >
                      <span className="min-w-0 truncate">{title}</span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
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
              <h4 className="text-xl font-black text-[var(--color-text)]">
                {t('contactUs')}
              </h4>

              <div className="mt-5 space-y-4 text-base text-[var(--color-text-muted)]">
                {primaryContactMethods.slice(0, 3).map((item) => {
                  const href = getContactHref(item.type, item.value);
                  const label =
                    getLocalizedValue(locale, item.labelPt, item.labelEn) ||
                    getPublicContactDisplayValue(item);
                  const displayValue = getPublicContactDisplayValue(item);

                  return (
                    <div key={item.id}>
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        {label}
                      </p>

                      {href ? (
                        <a
                          href={href}
                          target={item.type === 'SOCIAL' ? '_blank' : undefined}
                          rel={item.type === 'SOCIAL' ? 'noreferrer' : undefined}
                          className="mt-1 block break-words leading-7 transition hover:text-[var(--color-text)] [overflow-wrap:anywhere]"
                        >
                          {displayValue}
                        </a>
                      ) : (
                        <p className="mt-1 break-words leading-7 [overflow-wrap:anywhere]">
                          {displayValue}
                        </p>
                      )}
                    </div>
                  );
                })}

                {address ? (
                  <div className="pt-1 leading-8">{address}</div>
                ) : null}
              </div>

              {socialContactMethods.length ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  {socialContactMethods.map((item) => {
                    const href = getContactHref(item.type, item.value);

                    if (!href) return null;

                    const label =
                      getLocalizedValue(locale, item.labelPt, item.labelEn) ||
                      getPublicContactDisplayValue(item);

                    return (
                      <a
                        key={item.id}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        title={label}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]"
                      >
                        <PublicContactIcon
                          type={item.type}
                          iconName={item.iconName}
                          className="h-5 w-5"
                        />
                      </a>
                    );
                  })}
                </div>
              ) : null}
            </motion.div>
          </div>
        </div>
      </footer>
    </main>
  );
}