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
import {useInfiniteQuery} from '@tanstack/react-query';
import {PageViewTracker} from '@/features/analytics/components/page-view-tracker';
import {getPublicSectionItemsPage} from '../api';
import {BackgroundVideo} from './background-video';

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

function hasMeaningfulText(value?: string | null) {
  return Boolean(value && value.trim().length > 0);
}

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
              <BackgroundVideo
                src={resolvedCoverVideoUrl}
                className="h-full w-full object-cover"
              />
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
  videoUrl,
  fallbackVideoTitle
}: {
  title: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  fallbackVideoTitle: string;
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
              title={title || fallbackVideoTitle}
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
  blocks,
  t
}: {
  locale: string;
  blocks: SectionContentBlockResponse[];
  t: TranslateFn;
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
                title={title || subtitle || t('contentLabel')}
                imageUrl={block.imageUrl}
                videoUrl={block.videoUrl}
                fallbackVideoTitle={t('videoLabel')}
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
  noImageLabel,
  itemLabel,
  untitledLabel
}: {
  locale: string;
  item: PublicSectionItemResponse;
  onOpen: (item: PublicSectionItemResponse) => void;
  featuredLabel: string;
  detailsLabel: string;
  noImageLabel: string;
  itemLabel: string;
  untitledLabel: string;
}) {
  const title =
    getLocalizedValue(locale, item.titlePt, item.titleEn) || untitledLabel;

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
      className="group block w-full overflow-hidden rounded-[30px] border border-slate-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {itemImageUrl ? (
          <>
            <Image
              src={itemImageUrl}
              alt={title}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100 text-slate-500">
            {noImageLabel}
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          {item.isFeatured ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-900 shadow-lg backdrop-blur">
              <Star className="h-3.5 w-3.5" />
              {featuredLabel}
            </div>
          ) : (
            <div />
          )}

          <div className="rounded-full bg-slate-950/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
            {detailsLabel}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="text-2xl font-black tracking-[-0.03em] text-white drop-shadow-sm">
            {title}
          </h3>
        </div>
      </div>

      <div className="space-y-4 p-6">
        {shortDescription ? (
          <p className="line-clamp-3 text-base leading-7 text-slate-600">
            {shortDescription}
          </p>
        ) : (
          <p className="text-sm text-slate-400">{detailsLabel}</p>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {itemLabel}
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition group-hover:text-slate-950">
            {detailsLabel}
          </span>
        </div>
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
  noImageLabel,
  untitledLabel,
  portfolioLabel,
  portfolioProjectLabel,
  visitProjectLabel,
  notAvailableLabel
}: {
  locale: string;
  project: PortfolioProjectResponse;
  onOpen: (project: PortfolioProjectResponse) => void;
  featuredLabel: string;
  detailsLabel: string;
  noImageLabel: string;
  untitledLabel: string;
  portfolioLabel: string;
  portfolioProjectLabel: string;
  visitProjectLabel: string;
  notAvailableLabel: string;
}) {
  const title =
    getLocalizedValue(locale, project.titlePt, project.titleEn) || untitledLabel;

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
      className="group block w-full overflow-hidden rounded-[30px] border border-slate-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {projectImageUrl ? (
          <>
            <Image
              src={projectImageUrl}
              alt={title}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100 text-slate-500">
            {noImageLabel}
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          {project.isFeatured ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-900 shadow-lg backdrop-blur">
              <Star className="h-3.5 w-3.5" />
              {featuredLabel}
            </div>
          ) : (
            <div />
          )}

          <div className="rounded-full bg-slate-950/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
            {detailsLabel}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="text-2xl font-black tracking-[-0.03em] text-white drop-shadow-sm">
            {title}
          </h3>
        </div>
      </div>

      <div className="space-y-4 p-6">
        {shortDescription ? (
          <p className="line-clamp-3 text-base leading-7 text-slate-600">
            {shortDescription}
          </p>
        ) : (
          <p className="text-sm text-slate-400">{portfolioProjectLabel}</p>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {portfolioLabel}
          </span>

          <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition group-hover:text-slate-950">
            {project.projectUrl ? visitProjectLabel : notAvailableLabel}
          </span>
        </div>
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
  onOpenItem,
  categoryLabel,
  itemLabel,
  untitledLabel,
  emptyCategoryItemsLabel
}: {
  locale: string;
  category: SectionCategoryResponse;
  items: PublicSectionItemResponse[];
  noImageLabel: string;
  featuredLabel: string;
  detailsLabel: string;
  onOpenItem: (item: PublicSectionItemResponse) => void;
  categoryLabel: string;
  itemLabel: string;
  untitledLabel: string;
  emptyCategoryItemsLabel: string;
}) {
  const title =
    getLocalizedValue(locale, category.namePt, category.nameEn) || categoryLabel;

  const description =
    getLocalizedValue(
      locale,
      category.descriptionPt,
      category.descriptionEn
    ) || '';

  return (
    <motion.div variants={fadeUp} className="space-y-7">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              <Layers3 className="h-4 w-4" />
              {categoryLabel}
            </div>

            <h3 className="text-3xl font-black tracking-[-0.03em] text-slate-950">
              {title || untitledLabel}
            </h3>

            {description ? (
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                {description}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            {items.length}
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
              itemLabel={itemLabel}
              untitledLabel={untitledLabel}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
          {emptyCategoryItemsLabel}
        </div>
      )}
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

  const hasShortDescription = hasMeaningfulText(shortDescription);
  const hasFullDescription = hasMeaningfulText(fullDescription);
  const hasSpecifications = hasMeaningfulText(specifications);

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
              aria-label={t('close') }
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

              {hasShortDescription ? (
                <p className="break-words text-lg leading-8 text-slate-700 [overflow-wrap:anywhere]">
                  {shortDescription}
                </p>
              ) : null}

              {hasFullDescription || hasSpecifications ? (
                <div
                  className={`grid gap-8 ${
                    hasFullDescription && hasSpecifications
                      ? 'lg:grid-cols-[minmax(0,1.2fr)_320px]'
                      : ''
                  }`}
                >
                  {hasFullDescription ? (
                    <div className="min-w-0">
                      <h4 className="text-2xl font-black text-slate-950">
                        {t('details')}
                      </h4>

                      <div className="mt-4 whitespace-pre-line break-words text-base leading-8 text-slate-600 [overflow-wrap:anywhere]">
                        {fullDescription}
                      </div>
                    </div>
                  ) : null}

                  {hasSpecifications ? (
                    <div className="min-w-0 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <h4 className="text-xl font-black text-slate-950">
                        {t('specifications')}
                      </h4>

                      <div className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-slate-600 [overflow-wrap:anywhere]">
                        {specifications}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
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
  const [media, setMedia] = useState<PortfolioProjectMediaResponse[]>([]);

  useEffect(() => {
    let active = true;

    getPublicPortfolioProjectMedia(project.id)
      .then((items) => {
        if (active) {
          setMedia(items);
        }
      })
      .catch(() => {
        if (active) {
          setMedia([]);
        }
      });

    return () => {
      active = false;
    };
  }, [project.id]);

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

  const hasShortDescription = hasMeaningfulText(shortDescription);
  const hasFullDescription = hasMeaningfulText(fullDescription);
  const hasClient = hasMeaningfulText(project.clientName);
  const hasProjectDate = hasMeaningfulText(projectDate);
  const hasLocation = hasMeaningfulText(location);

  const projectImageUrl = resolveMediaUrl(project.coverImageUrl);
  const projectVideoUrl = resolveMediaUrl(project.videoUrl);

  const fallbackMedia = useMemo(() => {
    const items: PortfolioProjectMediaResponse[] = [];

    if (projectImageUrl) {
      items.push({
        id: -1,
        projectId: project.id,
        mediaType: 'IMAGE',
        mediaUrl: projectImageUrl,
        thumbnailUrl: null,
        altTextPt: project.titlePt,
        altTextEn: project.titleEn,
        isActive: true,
        sortOrder: 0,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      });
    }

    if (projectVideoUrl) {
      items.push({
        id: -2,
        projectId: project.id,
        mediaType: 'VIDEO',
        mediaUrl: projectVideoUrl,
        thumbnailUrl: null,
        altTextPt: project.titlePt,
        altTextEn: project.titleEn,
        isActive: true,
        sortOrder: 1,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      });
    }

    return items;
  }, [project.createdAt, project.id, project.titleEn, project.titlePt, project.updatedAt, projectImageUrl, projectVideoUrl]);

  const galleryMedia = media.length ? media : fallbackMedia;

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
              aria-label={t('close')}
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
  fallbackImageUrl={project.coverImageUrl}
  fallbackVideoUrl={project.videoUrl}
  loadingLabel={t('loadingMedia')}
  noMediaLabel={t('noMedia')}
/>
           

            <div className="space-y-8 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3">
                {project.isFeatured ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                    <Star className="h-3.5 w-3.5" />
                    {t('featured')}
                  </span>
                ) : null}
              </div>

              {hasShortDescription ? (
                <p className="break-words text-lg leading-8 text-slate-700 [overflow-wrap:anywhere]">
                  {shortDescription}
                </p>
              ) : null}

              {hasFullDescription || hasClient || hasProjectDate || hasLocation ? (
                <div
                  className={`grid gap-8 ${
                    hasFullDescription && (hasClient || hasProjectDate || hasLocation)
                      ? 'lg:grid-cols-[minmax(0,1.2fr)_320px]'
                      : ''
                  }`}
                >
                  {hasFullDescription ? (
                    <div className="min-w-0">
                      <h4 className="text-2xl font-black text-slate-950">
                        {t('details')}
                      </h4>

                      <div className="mt-4 whitespace-pre-line break-words text-base leading-8 text-slate-600 [overflow-wrap:anywhere]">
                        {fullDescription}
                      </div>
                    </div>
                  ) : null}

                  {hasClient || hasProjectDate || hasLocation ? (
                    <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <h4 className="text-xl font-black text-slate-950">
                        {t('projectInfo')}
                      </h4>

                      {hasClient ? (
                        <div className="flex items-start gap-3 text-sm leading-7 text-slate-600">
                          <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800">{t('client')}</p>
                            <p className="break-words [overflow-wrap:anywhere]">
                              {project.clientName}
                            </p>
                          </div>
                        </div>
                      ) : null}

                      {hasProjectDate ? (
                        <div className="flex items-start gap-3 text-sm leading-7 text-slate-600">
                          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800">{t('date')}</p>
                            <p>{projectDate}</p>
                          </div>
                        </div>
                      ) : null}

                      {hasLocation ? (
                        <div className="flex items-start gap-3 text-sm leading-7 text-slate-600">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800">{t('location')}</p>
                            <p className="break-words [overflow-wrap:anywhere]">
                              {location}
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Pulls in the next page of items. Only rendered when the server said there
 * is one, so a section that fits on a single page shows no control at all.
 */
function LoadMoreItems({
  query,
  label
}: {
  query: {
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
  };
  label: string;
}) {
  if (!query.hasNextPage) return null;

  return (
    <div className="mt-10 flex justify-center">
      <button
        type="button"
        disabled={query.isFetchingNextPage}
        onClick={() => query.fetchNextPage()}
        className="inline-flex min-h-12 items-center rounded-full border border-[var(--color-primary)] bg-white px-8 py-3 text-base font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary-soft)] disabled:opacity-60"
      >
        {label}
      </button>
    </div>
  );
}

export default function PublicSectionPage({locale, data}: Props) {
  const t = useTranslations('PublicSite');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'uncategorized' | null>(null);

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

  const isDirectItems = data.section.sectionType === 'DIRECT_ITEMS';

  const defaultCategoryId: number | 'uncategorized' | null = isDirectItems
    ? null
    : data.categories.length > 0
      ? data.categories[0].id
      : data.hasUncategorizedItems
        ? 'uncategorized'
        : null;

  const effectiveSelectedCategoryId =
    selectedCategoryId ?? defaultCategoryId;

  const selectedCategory = useMemo(() => {
    if (typeof effectiveSelectedCategoryId !== 'number') {
      return null;
    }

    return (
      data.categories.find(
        (category) => category.id === effectiveSelectedCategoryId
      ) ?? null
    );
  }, [data.categories, effectiveSelectedCategoryId]);

  // Items arrive a page at a time, for the selected category only. The server
  // already rendered the first page of the default selection, so that one is
  // seeded rather than re-fetched.
  const isDefaultSelection = effectiveSelectedCategoryId === defaultCategoryId;

  const itemsQuery = useInfiniteQuery({
    queryKey: [
      'public-section-items',
      data.section.id,
      effectiveSelectedCategoryId
    ],
    initialPageParam: 0,
    queryFn: ({pageParam}) =>
      getPublicSectionItemsPage(
        data.section.id,
        effectiveSelectedCategoryId,
        pageParam
      ),
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    initialData:
      isDefaultSelection && data.initialItems
        ? {pages: [data.initialItems], pageParams: [0]}
        : undefined
  });

  const loadedItems = useMemo(
    () => itemsQuery.data?.pages.flatMap((page) => page.content) ?? [],
    [itemsQuery.data]
  );

  const totalItems = itemsQuery.data?.pages[0]?.totalElements ?? 0;
  const selectedCategoryItems = loadedItems;

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <PageViewTracker
        path={`/sections/${data.section.slug}`}
        sectionSlug={data.section.slug}
      />
      <SectionHero
        title={sectionTitle}
        description={sectionDescription}
        coverImageUrl={data.section.coverImageUrl}
        coverVideoUrl={data.section.coverVideoUrl}
        backLabel={t('backHome')}
      />

      {data.section.sectionType === 'CONTENT' ? (
        data.contentBlocks.length ? (
          <ContentBlocksSection locale={locale} blocks={data.contentBlocks} t={t} />
        ) : null
      ) : null}

      {data.section.sectionType === 'CATEGORY_ITEMS' ? (
        <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-20">
          <motion.div
            initial={{opacity: 0, y: 24}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.2}}
            transition={{duration: 0.6}}
            className="mb-10 flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-text)] text-[var(--color-background)]">
              <Layers3 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-3xl font-black tracking-[-0.03em] text-[var(--color-text)]">
                {t('categoriesAndItems')}
              </h2>
              <p className="mt-1 text-[var(--color-text-muted)]">
                {t('categoriesAndItemsDescription')}
              </p>
            </div>
          </motion.div>

          {data.categories.length > 0 || data.hasUncategorizedItems ? (
            <motion.div
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.2}}
              transition={{duration: 0.5}}
              className="mb-10 flex flex-wrap gap-3"
            >
              {data.categories.map((category) => {
                const label =
                  getLocalizedValue(locale, category.namePt, category.nameEn) ||
                  t('categoryLabel');

                const isActive = effectiveSelectedCategoryId === category.id;

                return (
                 <button
  key={category.id}
  type="button"
  onClick={() => setSelectedCategoryId(category.id)}
  className={`inline-flex min-h-12 items-center gap-2 rounded-full border px-5 py-3 text-base font-semibold transition ${
    isActive
      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)]'
      : 'border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]'
  }`}
>
  <span>{label}</span>
</button>
                );
              })}

              {data.hasUncategorizedItems ? (
                <button
  type="button"
  onClick={() => setSelectedCategoryId('uncategorized')}
  className={`inline-flex min-h-12 items-center gap-2 rounded-full border px-5 py-3 text-base font-semibold transition ${
    effectiveSelectedCategoryId === 'uncategorized'
      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)]'
      : 'border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]'
  }`}
>
  <span>{t('uncategorized')}</span>
</button>
              ) : null}
            </motion.div>
          ) : null}

          {selectedCategory ? (
            <motion.div
  initial={{opacity: 0, y: 20}}
  whileInView={{opacity: 1, y: 0}}
  viewport={{once: true, amount: 0.2}}
  transition={{duration: 0.5}}
  className="mb-8 flex flex-wrap gap-3"
>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                    <Layers3 className="h-3.5 w-3.5" />
                    {t('categoryLabel')}
                  </div>

                  <h3 className="text-3xl font-black tracking-[-0.03em] text-[var(--color-text)]">
                    {getLocalizedValue(
                      locale,
                      selectedCategory.namePt,
                      selectedCategory.nameEn
                    ) || t('categoryLabel')}
                  </h3>

                  {hasMeaningfulText(
                    getLocalizedValue(
                      locale,
                      selectedCategory.descriptionPt,
                      selectedCategory.descriptionEn
                    )
                  ) ? (
                    <p className="mt-3 max-w-3xl text-base leading-8 text-[var(--color-text-muted)]">
                      {getLocalizedValue(
                        locale,
                        selectedCategory.descriptionPt,
                        selectedCategory.descriptionEn
                      )}
                    </p>
                  ) : null}
                </div>

                <div className="inline-flex h-12 min-w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 text-sm font-bold text-[var(--color-text)]">
                  {totalItems}
                </div>
              </div>
            </motion.div>
          ) : null}

          {selectedCategoryItems.length ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
              {selectedCategoryItems.map((item) => (
                <ItemCard
                  key={item.id}
                  locale={locale}
                  item={item}
                  onOpen={(value) => setActiveModal({type: 'item', item: value})}
                  featuredLabel={t('featured')}
                  detailsLabel={t('details')}
                  noImageLabel={t('noImage')}
                  itemLabel={t('itemLabel')}
                  untitledLabel={t('untitled')}
                />
              ))}
            </motion.div>
          ) : itemsQuery.isPending ? null : selectedCategory ||
            effectiveSelectedCategoryId === 'uncategorized' ? (
            <div className="rounded-[28px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] p-10 text-center">
              <h3 className="text-2xl font-black text-[var(--color-text)]">
                {t('noItemsYet')}
              </h3>
            </div>
          ) : null}

          <LoadMoreItems query={itemsQuery} label={t('loadMore')} />
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

          {loadedItems.length ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{once: true, amount: 0.12}}
              className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
              {loadedItems.map((item) => (
                <motion.div key={item.id} variants={fadeUp}>
                  <ItemCard
                    locale={locale}
                    item={item}
                    onOpen={(value) => setActiveModal({type: 'item', item: value})}
                    featuredLabel={t('featured')}
                    detailsLabel={t('details')}
                    noImageLabel={t('noImage')}
                    itemLabel={t('itemLabel')}
                    untitledLabel={t('untitled')}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : itemsQuery.isPending ? null : (
            <div className="rounded-[32px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <Package className="mx-auto h-10 w-10 text-slate-400" />
              <h2 className="mt-5 text-3xl font-black text-slate-950">
                {t('noItemsYet')}
              </h2>
            </div>
          )}

          <LoadMoreItems query={itemsQuery} label={t('loadMore')} />
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
                    untitledLabel={t('untitled')}
                    portfolioLabel={t('portfolioLabel')}
                    portfolioProjectLabel={t('portfolioProjectLabel')}
                    visitProjectLabel={t('visitProject')}
                    notAvailableLabel={t('notAvailable')}
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