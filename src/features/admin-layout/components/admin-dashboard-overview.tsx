'use client';

import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {
  Briefcase,
  FileText,
  Home,
  Image as ImageIcon,
  LayoutGrid,
  Package,
  Phone,
  Tags,
  type LucideIcon
} from 'lucide-react';
import {SettingsCard} from '@/components/common/settings-card';
import {getAnalyticsSummary} from '@/features/analytics/api';
import {getContentStats} from '@/features/stats/api';
import {DEFAULT_ANALYTICS_RANGE_DAYS, type AnalyticsRangeDays} from '@/features/analytics/constants';
import {RangeFilter} from '@/features/analytics/components/range-filter';
import {TrendChart} from '@/features/analytics/components/trend-chart';
import {TopSectionsList} from '@/features/analytics/components/top-sections-list';

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

function MetricTile({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none text-slate-950">{value}</p>
        <p className="text-xs leading-tight text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export function AdminDashboardOverview() {
  const t = useTranslations('AdminDashboardPage');
  const common = useTranslations('Common');

  const [rangeDays, setRangeDays] = useState<AnalyticsRangeDays>(
    DEFAULT_ANALYTICS_RANGE_DAYS
  );

  // One request of counts, instead of downloading every row of nine tables
  // just to display how many there are.
  const statsQuery = useQuery({
    queryKey: ['content-stats'],
    queryFn: getContentStats
  });

  const analyticsQuery = useQuery({
    queryKey: ['analytics', 'summary', rangeDays],
    queryFn: () => getAnalyticsSummary(rangeDays)
  });

  const isLoading = statsQuery.isPending;
  const hasError = statsQuery.isError;

  // A dash rather than 0 while the counts are unknown: showing zeros next to
  // a "failed to load" message reads as "you have no content".
  const unknown = '—';

  const count = (value?: number) =>
    statsQuery.data ? (value ?? 0) : unknown;

  const counts = {
    sections: count(statsQuery.data?.sections),
    categories: count(statsQuery.data?.categories),
    items: count(statsQuery.data?.items),
    projects: count(statsQuery.data?.portfolioProjects),
    contentBlocks: count(statsQuery.data?.contentBlocks),
    media: count(statsQuery.data?.mediaFiles),
    homeCards: count(statsQuery.data?.homeCards),
    contactMethods: count(statsQuery.data?.contactMethods)
  };

  const analytics = analyticsQuery.data;

  const rangeLabels: Record<AnalyticsRangeDays, string> = {
    7: t('range7d'),
    30: t('range30d'),
    90: t('range90d')
  };

  return (
    <div className="space-y-8">
      <SettingsCard title={t('analyticsTitle')} description={t('analyticsDescription')}>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {t('analyticsAllTimeCaption', {count: analytics?.viewsAllTime ?? 0})}
            </p>
            <RangeFilter
              value={rangeDays}
              onChange={setRangeDays}
              labels={rangeLabels}
              ariaLabel={t('rangeFilterLabel')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={t('viewsTodayLabel')}
              value={analytics?.viewsToday ?? 0}
              hint={t('viewsTodayHint')}
              tone="emerald"
            />
            <StatCard
              label={t('viewsInRangeLabel')}
              value={analytics?.viewsInRange ?? 0}
              hint={t('viewsInRangeHint')}
              tone="blue"
            />
            <StatCard
              label={t('uniqueVisitorsTodayLabel')}
              value={analytics?.uniqueVisitorsToday ?? 0}
              hint={t('uniqueVisitorsTodayHint')}
              tone="amber"
            />
            <StatCard
              label={t('uniqueVisitorsInRangeLabel')}
              value={analytics?.uniqueVisitorsInRange ?? 0}
              hint={t('uniqueVisitorsInRangeHint')}
            />
          </div>

          {analyticsQuery.isError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
              <p className="text-sm text-red-700">{t('analyticsLoadError')}</p>
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
              <TrendChart
                data={analytics?.dailySeries ?? []}
                viewsLabel={t('trendChartViewsLabel')}
                uniqueVisitorsLabel={t('trendChartVisitorsLabel')}
                emptyText={t('trendChartEmpty')}
              />

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {t('topSectionsTitle')}
                  </h3>
                  <p className="text-xs text-slate-500">{t('topSectionsDescription')}</p>
                </div>
                <TopSectionsList
                  sections={analytics?.topSections ?? []}
                  emptyText={t('topSectionsEmpty')}
                  viewsLabel={t('topSectionsViewsUnit')}
                />
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            {t('contentOverviewTitle')}
          </h2>
          <p className="text-sm text-slate-500">{t('contentOverviewDescription')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricTile icon={LayoutGrid} label={t('stats.sectionsLabel')} value={counts.sections} />
          <MetricTile icon={Tags} label={t('stats.categoriesLabel')} value={counts.categories} />
          <MetricTile icon={Package} label={t('stats.itemsLabel')} value={counts.items} />
          <MetricTile icon={ImageIcon} label={t('stats.mediaLabel')} value={counts.media} />
          <MetricTile icon={Briefcase} label={t('stats.projectsLabel')} value={counts.projects} />
          <MetricTile icon={FileText} label={t('stats.contentBlocksLabel')} value={counts.contentBlocks} />
          <MetricTile icon={Home} label={t('stats.homeCardsLabel')} value={counts.homeCards} />
          <MetricTile icon={Phone} label={t('stats.contactMethodsLabel')} value={counts.contactMethods} />
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
      </section>
    </div>
  );
}
