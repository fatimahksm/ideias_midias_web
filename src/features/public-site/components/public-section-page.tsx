'use client';
import {useEffect, useMemo, useState} from 'react';
import Image from 'next/image';
import {AnimatePresence, motion} from 'framer-motion';
import {useTranslations} from 'next-intl';
import {
  ArrowLeft,
  CalendarDays,
  CircleX,
  FileText,
  FolderKanban,
  Layers3,
  MapPin,
  Package,
  Star,
  Tag,
  UserRound
} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import type {SectionCategoryResponse} from '@/features/categories/types';
import type {SectionContentBlockResponse} from '@/features/content-blocks/types';
import type {PortfolioProjectResponse} from '@/features/portfolio-projects/types';
import type {SectionItemMediaResponse} from '@/features/item-media/types';
import type {PortfolioProjectMediaResponse} from '@/features/portfolio-project-media/types';
import type {PublicSectionItemResponse, PublicSectionPageData} from '../types';
import {getPublicItemMedia, getPublicPortfolioProjectMedia} from '../api';
import PublicMediaGallery from './public-media-gallery';
import {
  getLocalizedValue,
  isEmbeddableVideoUrl,
  toEmbeddableVideoUrl
} from '../utils';
import {resolveMediaUrl} from '@/lib/media/resolve-media-url';

type Props = {
  locale: string;
  data: PublicSectionPageData;
};

type ActiveModal =
  | {type: 'item'; item: PublicSectionItemResponse}
  | {type: 'project'; project: PortfolioProjectResponse}
  | null;

type TranslateFn = (key: string) => string;

const fadeUp = {
  hidden: {opacity: 0, y: 28},
  visible: {opacity: 1, y: 0}
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

function SectionHero({
  title,
  description,
  coverImageUrl,
  coverVideoUrl,
  backLabel
}: {
  title: string;
  description: string;
  coverImageUrl?: string | null;
  coverVideoUrl?: string | null;
  backLabel: string;
}) {
  const resolvedCoverImageUrl = resolveMediaUrl(coverImageUrl);
  const resolvedCoverVideoUrl = resolveMediaUrl(coverVideoUrl);

  return (
    <section className="relative isolate overflow-hidden">
      {resolvedCoverImageUrl ? (
        <>
          <div className="absolute inset-0">
            <Image
              src={resolvedCoverImageUrl}
              alt={title}
              fill
              priority
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/75" />
        </>
      ) : resolvedCoverVideoUrl ? (
        <>
          <div className="absolute inset-0">
            {isEmbeddableVideoUrl(resolvedCoverVideoUrl) ? (
             <iframe
  src={toEmbeddableVideoUrl(resolvedCoverVideoUrl) ?? resolvedCoverVideoUrl}
  title={title}
  className="h-full w-full"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowFullScreen
/>
            ) : (
              <video
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src={resolvedCoverVideoUrl} />
              </video>
            )}
          </div>
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/75" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[var(--color-secondary)]" />
      )}

      <div className="absolute left-1/2 top-[-100px] h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-white md:px-8 md:py-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl"
        >
          <motion.div variants={fadeUp}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/85 backdrop-blur-md transition hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-5xl font-black tracking-[-0.04em] md:text-7xl"
          >
            {title}
          </motion.h1>

          {description ? (
            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-3xl text-lg leading-8 text-white/85 md:text-xl"
            >
              {description}
            </motion.p>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}

function BlockMedia({
  title,
  imageUrl,
  videoUrl
}: {
  title: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
}) {
  const resolvedImageUrl = resolveMediaUrl(imageUrl);
  const resolvedVideoUrl = resolveMediaUrl(videoUrl);

  if (!resolvedImageUrl && !resolvedVideoUrl) return null;

  return (
    <>
      {resolvedImageUrl ? (
        <div className="relative h-[280px] w-full bg-slate-100 md:h-[440px]">
          <Image
            src={resolvedImageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      ) : null}

      {resolvedVideoUrl ? (
        <div className="aspect-video w-full bg-black">
          {isEmbeddableVideoUrl(resolvedVideoUrl) ? (
           <iframe
  src={toEmbeddableVideoUrl(resolvedVideoUrl) ?? resolvedVideoUrl}
  title={title || 'Video'}
  className="h-full w-full"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowFullScreen
/>
          ) : (
            <video className="h-full w-full" controls playsInline preload="metadata">
              <source src={resolvedVideoUrl} />
            </video>
          )}
        </div>
      ) : null}
    </>
  );
}

function ContentBlocksSection({
  locale,
  blocks
}: {
  locale: string;
  blocks: SectionContentBlockResponse[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{once: true, amount: 0.12}}
        className="space-y-10"
      >
        {blocks.map((block) => {
          const title =
            getLocalizedValue(locale, block.titlePt, block.titleEn) || '';
          const subtitle =
            getLocalizedValue(locale, block.subtitlePt, block.subtitleEn) || '';
          const content =
            getLocalizedValue(locale, block.contentPt, block.contentEn) || '';

          return (
            <motion.div
              key={block.id}
              variants={fadeUp}
              className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm"
            >
              <BlockMedia
                title={title || subtitle || 'Content'}
                imageUrl={block.imageUrl}
                videoUrl={block.videoUrl}
              />

              <div className="p-8 md:p-10">
                {title ? (
                  <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-950 md:text-4xl">
                    {title}
                  </h2>
                ) : null}

                {subtitle ? (
                  <p className="mt-3 text-lg font-medium text-slate-700">
                    {subtitle}
                  </p>
                ) : null}

                {content ? (
                  <div className="mt-5 whitespace-pre-line text-base leading-8 text-slate-600">
                    {content}
                  </div>
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

function ItemCard({
  locale,
  item,
  onOpen,
  featuredLabel,
  detailsLabel,
  noImageLabel
}: {
  locale: string;
  item: PublicSectionItemResponse;
  onOpen: (item: PublicSectionItemResponse) => void;
  featuredLabel: string;
  detailsLabel: string;
  noImageLabel: string;
}) {
  const title =
    getLocalizedValue(locale, item.titlePt, item.titleEn) || 'Untitled';

  const shortDescription =
    getLocalizedValue(
      locale,
      item.shortDescriptionPt,
      item.shortDescriptionEn
    ) || '';

  const itemImageUrl = resolveMediaUrl(item.coverImageUrl);

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="group block w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"
    >
      <div className="relative h-72 overflow-hidden bg-slate-100">
        {itemImageUrl ? (
          <Image
            src={itemImageUrl}
            alt={title}
            fill
            className="object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">
            {noImageLabel}
          </div>
        )}

        {item.isFeatured ? (
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-slate-950/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-lg">
            <Star className="h-3.5 w-3.5" />
            {featuredLabel}
          </div>
        ) : null}
      </div>

      <div className="space-y-4 p-6">
        <h3 className="text-2xl font-black tracking-[-0.03em] text-slate-950">
          {title}
        </h3>

        {shortDescription ? (
          <p className="line-clamp-3 text-base leading-7 text-slate-600">
            {shortDescription}
          </p>
        ) : null}

        <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          {detailsLabel}
        </span>
      </div>
    </button>
  );
}

function ProjectCard({
  locale,
  project,
  onOpen,
  featuredLabel,
  detailsLabel,
  noImageLabel
}: {
  locale: string;
  project: PortfolioProjectResponse;
  onOpen: (project: PortfolioProjectResponse) => void;
  featuredLabel: string;
  detailsLabel: string;
  noImageLabel: string;
}) {
  const title =
    getLocalizedValue(locale, project.titlePt, project.titleEn) || 'Untitled';

  const shortDescription =
    getLocalizedValue(
      locale,
      project.shortDescriptionPt,
      project.shortDescriptionEn
    ) || '';

  const projectImageUrl = resolveMediaUrl(project.coverImageUrl);

  return (
    <button
      type="button"
      onClick={() => onOpen(project)}
      className="group block w-full overflow-hidden rounded-[30px] border border-slate-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"
    >
      <div className="relative h-80 overflow-hidden bg-slate-100">
        {projectImageUrl ? (
          <Image
            src={projectImageUrl}
            alt={title}
            fill
            className="object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">
            {noImageLabel}
          </div>
        )}

        {project.isFeatured ? (
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-slate-950/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-lg">
            <Star className="h-3.5 w-3.5" />
            {featuredLabel}
          </div>
        ) : null}
      </div>

      <div className="space-y-4 p-6">
        <h3 className="text-2xl font-black tracking-[-0.03em] text-slate-950">
          {title}
        </h3>

        {shortDescription ? (
          <p className="line-clamp-3 text-base leading-7 text-slate-600">
            {shortDescription}
          </p>
        ) : null}

        <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          {detailsLabel}
        </span>
      </div>
    </button>
  );
}

function CategorySection({
  locale,
  category,
  items,
  noImageLabel,
  featuredLabel,
  detailsLabel,
  onOpenItem
}: {
  locale: string;
  category: SectionCategoryResponse;
  items: PublicSectionItemResponse[];
  noImageLabel: string;
  featuredLabel: string;
  detailsLabel: string;
  onOpenItem: (item: PublicSectionItemResponse) => void;
}) {
  const title =
    getLocalizedValue(locale, category.namePt, category.nameEn) || 'Category';

  const description =
    getLocalizedValue(
      locale,
      category.descriptionPt,
      category.descriptionEn
    ) || '';

  const categoryImageUrl = resolveMediaUrl(category.imageUrl);

  return (
    <motion.div variants={fadeUp} className="space-y-7">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
          <div className="relative min-h-[220px] bg-slate-100">
            {categoryImageUrl ? (
              <Image
                src={categoryImageUrl}
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                {noImageLabel}
              </div>
            )}
          </div>

          <div className="p-8">
            <h3 className="text-3xl font-black tracking-[-0.03em] text-slate-950">
              {title}
            </h3>

            {description ? (
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {items.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              locale={locale}
              item={item}
              onOpen={onOpenItem}
              featuredLabel={featuredLabel}
              detailsLabel={detailsLabel}
              noImageLabel={noImageLabel}
            />
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}

function ItemModal({
  locale,
  item,
  onClose,
  t
}: {
  locale: string;
  item: PublicSectionItemResponse;
  onClose: () => void;
  t: TranslateFn;
}) {
  const [galleryMedia, setGalleryMedia] = useState<SectionItemMediaResponse[]>(
    []
  );
  const [isMediaLoading, setIsMediaLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setIsMediaLoading(true);

    getPublicItemMedia(item.id)
      .then((response) => {
        if (isMounted) {
          setGalleryMedia(response);
        }
      })
      .catch(() => {
        if (isMounted) {
          setGalleryMedia([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsMediaLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [item.id]);

  const title =
    getLocalizedValue(locale, item.titlePt, item.titleEn) || t('untitled');

  const shortDescription =
    getLocalizedValue(
      locale,
      item.shortDescriptionPt,
      item.shortDescriptionEn
    ) || '';

  const fullDescription =
    getLocalizedValue(
      locale,
      item.fullDescriptionPt,
      item.fullDescriptionEn
    ) || '';

  const specifications =
    getLocalizedValue(
      locale,
      item.specificationsPt,
      item.specificationsEn
    ) || '';

  return (
    <AnimatePresence>
      <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        exit={{opacity: 0}}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{opacity: 0, y: 30, scale: 0.98}}
          animate={{opacity: 1, y: 0, scale: 1}}
          exit={{opacity: 0, y: 20, scale: 0.98}}
          transition={{duration: 0.25}}
          className="mx-auto mt-6 max-h-[calc(100vh-3rem)] w-[min(960px,92vw)] overflow-hidden rounded-[32px] bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h3 className="text-xl font-black text-slate-950">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
            >
              <CircleX className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
            <PublicMediaGallery
              locale={locale}
              title={title}
              media={galleryMedia}
              fallbackImageUrl={item.coverImageUrl}
              fallbackVideoUrl={item.videoUrl}
              isLoading={isMediaLoading}
              loadingLabel={t('loadingMedia')}
              noMediaLabel={t('noMedia')}
            />

            <div className="space-y-8 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3">
                {item.isFeatured ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                    <Star className="h-3.5 w-3.5" />
                    {t('featured')}
                  </span>
                ) : null}

                {item.itemType ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                    <Tag className="h-3.5 w-3.5" />
                    {item.itemType}
                  </span>
                ) : null}
              </div>

              {shortDescription ? (
                <p className="text-lg leading-8 text-slate-700">
                  {shortDescription}
                </p>
              ) : null}

              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <h4 className="text-2xl font-black text-slate-950">
                    {t('details')}
                  </h4>

                  {fullDescription ? (
                    <div className="mt-4 whitespace-pre-line text-base leading-8 text-slate-600">
                      {fullDescription}
                    </div>
                  ) : (
                    <p className="mt-4 text-base leading-8 text-slate-500">
                      {t('noContentYet')}
                    </p>
                  )}
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <h4 className="text-xl font-black text-slate-950">
                    {t('specifications')}
                  </h4>

                  {specifications ? (
                    <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                      {specifications}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-slate-500">
                      {t('specificationsNotAvailable')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ProjectModal({
  locale,
  project,
  onClose,
  t
}: {
  locale: string;
  project: PortfolioProjectResponse;
  onClose: () => void;
  t: TranslateFn;
}) {
  const title =
    getLocalizedValue(locale, project.titlePt, project.titleEn) || t('untitled');

  const shortDescription =
    getLocalizedValue(
      locale,
      project.shortDescriptionPt,
      project.shortDescriptionEn
    ) || '';

  const fullDescription =
    getLocalizedValue(
      locale,
      project.fullDescriptionPt,
      project.fullDescriptionEn
    ) || '';

  const location =
    getLocalizedValue(locale, project.locationPt, project.locationEn) || '';

  const projectDate = project.projectDate
    ? new Date(project.projectDate).toLocaleDateString()
    : '';

  const projectImageUrl = resolveMediaUrl(project.coverImageUrl);
  const projectVideoUrl = resolveMediaUrl(project.videoUrl);

  return (
    <AnimatePresence>
      <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        exit={{opacity: 0}}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{opacity: 0, y: 30, scale: 0.98}}
          animate={{opacity: 1, y: 0, scale: 1}}
          exit={{opacity: 0, y: 20, scale: 0.98}}
          transition={{duration: 0.25}}
          className="mx-auto mt-6 max-h-[calc(100vh-3rem)] w-[min(980px,92vw)] overflow-hidden rounded-[32px] bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h3 className="text-xl font-black text-slate-950">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
            >
              <CircleX className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
            {projectImageUrl ? (
              <div className="relative h-[320px] w-full bg-slate-100 md:h-[460px]">
                <Image
                  src={projectImageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}

            {projectVideoUrl ? (
              <div className="aspect-video w-full bg-black">
                {isEmbeddableVideoUrl(projectVideoUrl) ? (
                  <iframe
                    src={projectVideoUrl}
                    title={title}
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
                    <source src={projectVideoUrl} />
                  </video>
                )}
              </div>
            ) : null}

            <div className="space-y-8 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3">
                {project.isFeatured ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                    <Star className="h-3.5 w-3.5" />
                    {t('featured')}
                  </span>
                ) : null}
              </div>

              {shortDescription ? (
                <p className="text-lg leading-8 text-slate-700">
                  {shortDescription}
                </p>
              ) : null}

              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <h4 className="text-2xl font-black text-slate-950">
                    {t('details')}
                  </h4>

                  {fullDescription ? (
                    <div className="mt-4 whitespace-pre-line text-base leading-8 text-slate-600">
                      {fullDescription}
                    </div>
                  ) : (
                    <p className="mt-4 text-base leading-8 text-slate-500">
                      {t('noContentYet')}
                    </p>
                  )}
                </div>

                <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <h4 className="text-xl font-black text-slate-950">
                    {t('projectInfo')}
                  </h4>

                  {project.clientName ? (
                    <div className="flex items-start gap-3 text-sm leading-7 text-slate-600">
                      <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                      <div>
                        <p className="font-semibold text-slate-800">{t('client')}</p>
                        <p>{project.clientName}</p>
                      </div>
                    </div>
                  ) : null}

                  {projectDate ? (
                    <div className="flex items-start gap-3 text-sm leading-7 text-slate-600">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                      <div>
                        <p className="font-semibold text-slate-800">{t('date')}</p>
                        <p>{projectDate}</p>
                      </div>
                    </div>
                  ) : null}

                  {location ? (
                    <div className="flex items-start gap-3 text-sm leading-7 text-slate-600">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                      <div>
                        <p className="font-semibold text-slate-800">{t('location')}</p>
                        <p>{location}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function PublicSectionPage({locale, data}: Props) {
  const t = useTranslations('PublicSite');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const sectionTitle = useMemo(
    () =>
      getLocalizedValue(locale, data.section.namePt, data.section.nameEn) ||
      t('untitled'),
    [data.section.nameEn, data.section.namePt, locale, t]
  );

  const sectionDescription = useMemo(
    () =>
      getLocalizedValue(
        locale,
        data.section.descriptionPt,
        data.section.descriptionEn
      ) || '',
    [data.section.descriptionEn, data.section.descriptionPt, locale]
  );

  const uncategorizedItems = useMemo(
    () => data.items.filter((item) => !item.categoryId),
    [data.items]
  );

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <SectionHero
        title={sectionTitle}
        description={sectionDescription}
        coverImageUrl={data.section.coverImageUrl}
        coverVideoUrl={data.section.coverVideoUrl}
        backLabel={t('backHome')}
      />

      {data.section.sectionType === 'CONTENT' ? (
        data.contentBlocks.length ? (
          <ContentBlocksSection locale={locale} blocks={data.contentBlocks} />
        ) : (
          <section className="mx-auto max-w-4xl px-6 py-20">
            <div className="rounded-[32px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <FileText className="mx-auto h-10 w-10 text-slate-400" />
              <h2 className="mt-5 text-3xl font-black text-slate-950">
                {t('noContentYet')}
              </h2>
            </div>
          </section>
        )
      ) : null}

      {data.section.sectionType === 'CATEGORY_ITEMS' ? (
        <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-20">
          <motion.div
            initial={{opacity: 0, y: 24}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.2}}
            transition={{duration: 0.6}}
            className="mb-12 flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Layers3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-950">
                {t('categoriesAndItems')}
              </h2>
              <p className="mt-1 text-slate-600">
                {t('categoriesAndItemsDescription')}
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{once: true, amount: 0.12}}
            className="space-y-14"
          >
            {data.categories.map((category) => (
              <CategorySection
                key={category.id}
                locale={locale}
                category={category}
                items={data.items.filter((item) => item.categoryId === category.id)}
                noImageLabel={t('noImage')}
                featuredLabel={t('featured')}
                detailsLabel={t('details')}
                onOpenItem={(item) => setActiveModal({type: 'item', item})}
              />
            ))}

            {uncategorizedItems.length ? (
              <motion.div variants={fadeUp} className="space-y-7">
                <h3 className="text-2xl font-black text-slate-950">
                  {t('uncategorized')}
                </h3>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {uncategorizedItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      locale={locale}
                      item={item}
                      onOpen={(value) => setActiveModal({type: 'item', item: value})}
                      featuredLabel={t('featured')}
                      detailsLabel={t('details')}
                      noImageLabel={t('noImage')}
                    />
                  ))}
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        </section>
      ) : null}

      {data.section.sectionType === 'DIRECT_ITEMS' ? (
        <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-20">
          <motion.div
            initial={{opacity: 0, y: 24}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.2}}
            transition={{duration: 0.6}}
            className="mb-12 flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-950">
                {t('items')}
              </h2>
              <p className="mt-1 text-slate-600">{t('itemsDescription')}</p>
            </div>
          </motion.div>

          {data.items.length ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{once: true, amount: 0.12}}
              className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
              {data.items.map((item) => (
                <motion.div key={item.id} variants={fadeUp}>
                  <ItemCard
                    locale={locale}
                    item={item}
                    onOpen={(value) => setActiveModal({type: 'item', item: value})}
                    featuredLabel={t('featured')}
                    detailsLabel={t('details')}
                    noImageLabel={t('noImage')}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="rounded-[32px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <Package className="mx-auto h-10 w-10 text-slate-400" />
              <h2 className="mt-5 text-3xl font-black text-slate-950">
                {t('noItemsYet')}
              </h2>
            </div>
          )}
        </section>
      ) : null}

      {data.section.sectionType === 'PORTFOLIO' ? (
        <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-20">
          <motion.div
            initial={{opacity: 0, y: 24}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.2}}
            transition={{duration: 0.6}}
            className="mb-12 flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-950">
                {t('portfolioProjects')}
              </h2>
              <p className="mt-1 text-slate-600">
                {t('portfolioProjectsDescription')}
              </p>
            </div>
          </motion.div>

          {data.projects.length ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{once: true, amount: 0.12}}
              className="grid gap-7 md:grid-cols-2 xl:grid-cols-3"
            >
              {data.projects.map((project) => (
                <motion.div key={project.id} variants={fadeUp}>
                  <ProjectCard
                    locale={locale}
                    project={project}
                    onOpen={(value) =>
                      setActiveModal({type: 'project', project: value})
                    }
                    featuredLabel={t('featured')}
                    detailsLabel={t('details')}
                    noImageLabel={t('noImage')}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="rounded-[32px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <FolderKanban className="mx-auto h-10 w-10 text-slate-400" />
              <h2 className="mt-5 text-3xl font-black text-slate-950">
                {t('noProjectsYet')}
              </h2>
            </div>
          )}
        </section>
      ) : null}

      {activeModal?.type === 'item' ? (
        <ItemModal
          locale={locale}
          item={activeModal.item}
          onClose={() => setActiveModal(null)}
          t={t}
        />
      ) : null}

      {activeModal?.type === 'project' ? (
        <ProjectModal
          locale={locale}
          project={activeModal.project}
          onClose={() => setActiveModal(null)}
          t={t}
        />
      ) : null}
    </main>
  );
}