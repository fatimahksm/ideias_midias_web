'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import type {SectionType} from '../types';

type Props = {
  sectionId?: number;
  sectionType: SectionType;
  isVisible: boolean;
};

type WorkspaceContent = {
  title: string;
  description: string;
  contentModelLabel: string;
  contentModelValue: string;
  nextModuleLabel: string;
  nextModuleValue: string;
  recommendation: string;
};

export function SectionNextActions({
  sectionId,
  sectionType,
  isVisible
}: Props) {
  const t = useTranslations('SectionNextActions');

  if (!isVisible || !sectionId) {
    return null;
  }

  const content: Record<SectionType, WorkspaceContent> = {
    CONTENT: {
      title: t('CONTENT.title'),
      description: t('CONTENT.description'),
      contentModelLabel: t('CONTENT.contentModelLabel'),
      contentModelValue: t('CONTENT.contentModelValue'),
      nextModuleLabel: t('CONTENT.nextModuleLabel'),
      nextModuleValue: t('CONTENT.nextModuleValue'),
      recommendation: t('CONTENT.recommendation')
    },
    CATEGORY_ITEMS: {
      title: t('CATEGORY_ITEMS.title'),
      description: t('CATEGORY_ITEMS.description'),
      contentModelLabel: t('CATEGORY_ITEMS.contentModelLabel'),
      contentModelValue: t('CATEGORY_ITEMS.contentModelValue'),
      nextModuleLabel: t('CATEGORY_ITEMS.nextModuleLabel'),
      nextModuleValue: t('CATEGORY_ITEMS.nextModuleValue'),
      recommendation: t('CATEGORY_ITEMS.recommendation')
    },
    DIRECT_ITEMS: {
      title: t('DIRECT_ITEMS.title'),
      description: t('DIRECT_ITEMS.description'),
      contentModelLabel: t('DIRECT_ITEMS.contentModelLabel'),
      contentModelValue: t('DIRECT_ITEMS.contentModelValue'),
      nextModuleLabel: t('DIRECT_ITEMS.nextModuleLabel'),
      nextModuleValue: t('DIRECT_ITEMS.nextModuleValue'),
      recommendation: t('DIRECT_ITEMS.recommendation')
    },
    PORTFOLIO: {
      title: t('PORTFOLIO.title'),
      description: t('PORTFOLIO.description'),
      contentModelLabel: t('PORTFOLIO.contentModelLabel'),
      contentModelValue: t('PORTFOLIO.contentModelValue'),
      nextModuleLabel: t('PORTFOLIO.nextModuleLabel'),
      nextModuleValue: t('PORTFOLIO.nextModuleValue'),
      recommendation: t('PORTFOLIO.recommendation')
    }
  };

  const current = content[sectionType];

  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-emerald-900">
            {t('workspaceLabel')}
          </p>
          <h3 className="text-lg font-semibold text-emerald-950">
            {current.title}
          </h3>
          <p className="max-w-3xl text-sm leading-6 text-emerald-800">
            {current.description}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white/80 px-4 py-3 text-sm text-emerald-900 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            {t('sectionIdLabel')}
          </p>
          <p className="mt-1 font-semibold">#{sectionId}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
            {current.contentModelLabel}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {current.contentModelValue}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
            {current.nextModuleLabel}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {current.nextModuleValue}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
            {t('recommendationLabel')}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {current.recommendation}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">
          {t('workspaceReadyTitle')}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {t('workspaceReadyDescription')}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/admin/sections/${sectionId}`}>
            <Button type="button" size="sm">
              {t('goToWorkspace')}
            </Button>
          </Link>

          <Link href={`/admin/sections/${sectionId}/edit`}>
            <Button type="button" variant="outline" size="sm">
              {t('editSectionSettings')}
            </Button>
          </Link>

          <Link href="/admin/sections">
            <Button type="button" variant="outline" size="sm">
              {t('backToStudio')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}