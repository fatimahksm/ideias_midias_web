'use client';

import {useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {SettingsCard} from '@/components/common/settings-card';
import {Button} from '@/components/ui/button';
import {getAllCategories} from '@/features/categories/api';
import {getAllContactMethods} from '@/features/contact-methods/api';
import {getAllContentBlocks} from '@/features/content-blocks/api';
import {getAllHomeCards} from '@/features/home-cards/api';
import {getAllItems} from '@/features/items/api';
import {getAllMedia} from '@/features/media-library/api';
import {getAllPortfolioProjects} from '@/features/portfolio-projects/api';
import {getAllSections} from '@/features/sections/api';

function StatCard({
  label,
  value,
  hint,
  tone = 'slate'
}: {
  label: string;
  value: number;
  hint: string;
  tone?: 'slate' | 'emerald' | 'blue' | 'amber';
}) {
  const toneClasses: Record<string, string> = {
    slate: 'border-slate-200 bg-white',
    emerald: 'border-emerald-200 bg-emerald-50',
    blue: 'border-blue-200 bg-blue-50',
    amber: 'border-amber-200 bg-amber-50'
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </div>
  );
}

function ActionLinkCard({
  title,
  description,
  href,
  actionLabel
}: {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <SettingsCard title={title} description={description}>
      <Link href={href}>
        <Button type="button">{actionLabel}</Button>
      </Link>
    </SettingsCard>
  );
}

export function AdminDashboardOverview() {
  const t = useTranslations('AdminDashboardPage');
  const common = useTranslations('Common');

  const sectionsQuery = useQuery({
    queryKey: ['sections', 'all'],
    queryFn: getAllSections
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: getAllCategories
  });

  const itemsQuery = useQuery({
    queryKey: ['items', 'all'],
    queryFn: getAllItems
  });

  const projectsQuery = useQuery({
    queryKey: ['portfolio-projects', 'all'],
    queryFn: getAllPortfolioProjects
  });

  const contentBlocksQuery = useQuery({
    queryKey: ['content-blocks', 'all'],
    queryFn: getAllContentBlocks
  });

  const mediaQuery = useQuery({
    queryKey: ['media-library', 'all'],
    queryFn: getAllMedia
  });

  const homeCardsQuery = useQuery({
    queryKey: ['home-cards', 'all'],
    queryFn: getAllHomeCards
  });

  const contactMethodsQuery = useQuery({
    queryKey: ['contact-methods', 'all'],
    queryFn: getAllContactMethods
  });

  const isLoading =
    sectionsQuery.isPending ||
    categoriesQuery.isPending ||
    itemsQuery.isPending ||
    projectsQuery.isPending ||
    contentBlocksQuery.isPending ||
    mediaQuery.isPending ||
    homeCardsQuery.isPending ||
    contactMethodsQuery.isPending;

  const hasError =
    sectionsQuery.isError ||
    categoriesQuery.isError ||
    itemsQuery.isError ||
    projectsQuery.isError ||
    contentBlocksQuery.isError ||
    mediaQuery.isError ||
    homeCardsQuery.isError ||
    contactMethodsQuery.isError;

  const counts = useMemo(
    () => ({
      sections: sectionsQuery.data?.length ?? 0,
      categories: categoriesQuery.data?.length ?? 0,
      items: itemsQuery.data?.length ?? 0,
      projects: projectsQuery.data?.length ?? 0,
      contentBlocks: contentBlocksQuery.data?.length ?? 0,
      media: mediaQuery.data?.length ?? 0,
      homeCards: homeCardsQuery.data?.length ?? 0,
      contactMethods: contactMethodsQuery.data?.length ?? 0
    }),
    [
      sectionsQuery.data,
      categoriesQuery.data,
      itemsQuery.data,
      projectsQuery.data,
      contentBlocksQuery.data,
      mediaQuery.data,
      homeCardsQuery.data,
      contactMethodsQuery.data
    ]
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('stats.sectionsLabel')}
          value={counts.sections}
          hint={t('stats.sectionsHint')}
        />
        <StatCard
          label={t('stats.categoriesLabel')}
          value={counts.categories}
          hint={t('stats.categoriesHint')}
          tone="blue"
        />
        <StatCard
          label={t('stats.itemsLabel')}
          value={counts.items}
          hint={t('stats.itemsHint')}
          tone="emerald"
        />
        <StatCard
          label={t('stats.mediaLabel')}
          value={counts.media}
          hint={t('stats.mediaHint')}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('stats.projectsLabel')}
          value={counts.projects}
          hint={t('stats.projectsHint')}
        />
        <StatCard
          label={t('stats.contentBlocksLabel')}
          value={counts.contentBlocks}
          hint={t('stats.contentBlocksHint')}
          tone="blue"
        />
        <StatCard
          label={t('stats.homeCardsLabel')}
          value={counts.homeCards}
          hint={t('stats.homeCardsHint')}
          tone="emerald"
        />
        <StatCard
          label={t('stats.contactMethodsLabel')}
          value={counts.contactMethods}
          hint={t('stats.contactMethodsHint')}
          tone="amber"
        />
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">{common('loading')}</p>
        </div>
      ) : null}

      {hasError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm text-red-700">{t('statsLoadError')}</p>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <ActionLinkCard
          title={t('siteSettingsCardTitle')}
          description={t('siteSettingsCardDescription')}
          href="/admin/site-settings"
          actionLabel={t('siteSettingsCardAction')}
        />

        <ActionLinkCard
          title={t('homeCardsCardTitle')}
          description={t('homeCardsCardDescription')}
          href="/admin/home-cards"
          actionLabel={t('homeCardsCardAction')}
        />

        <ActionLinkCard
          title={t('sectionsCardTitle')}
          description={t('sectionsCardDescription')}
          href="/admin/sections"
          actionLabel={t('sectionsCardAction')}
        />

        <ActionLinkCard
          title={t('mediaCardTitle')}
          description={t('mediaCardDescription')}
          href="/admin/media"
          actionLabel={t('mediaCardAction')}
        />

        <ActionLinkCard
          title={t('contactMethodsCardTitle')}
          description={t('contactMethodsCardDescription')}
          href="/admin/contact-methods"
          actionLabel={t('contactMethodsCardAction')}
        />

        <ActionLinkCard
          title={t('themeSettingsCardTitle')}
          description={t('themeSettingsCardDescription')}
          href="/admin/theme-settings"
          actionLabel={t('themeSettingsCardAction')}
        />
      </div>
    </div>
  );
}