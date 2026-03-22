'use client';

import {useTranslations} from 'next-intl';
import type {ContactMethodFormValues} from '../schema';
import {getContactHref} from '../utils';
import {ContactMethodTypeBadge} from './contact-method-type-badge';
import {
  CONTACT_ICON_OPTIONS,
  SOCIAL_PLATFORM_OPTIONS,
  type SocialPlatformValue
} from '../contact-method-options';

type Props = {
  values: ContactMethodFormValues;
  selectedPlatform: SocialPlatformValue;
};

export function ContactMethodFormSidebar({
  values,
  selectedPlatform
}: Props) {
  const t = useTranslations('ContactMethodForm');
  const href = getContactHref(values.type, values.value);

  const iconLabelKey =
    CONTACT_ICON_OPTIONS.find((item) => item.value === values.iconName)
      ?.labelKey;

  const platformLabelKey =
    SOCIAL_PLATFORM_OPTIONS.find((item) => item.value === selectedPlatform)
      ?.labelKey;

  return (
    <div className="space-y-5 xl:sticky xl:top-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          <ContactMethodTypeBadge type={values.type} />
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
              values.isActive
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
          >
            {values.isActive ? t('statusActive') : t('statusInactive')}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-slate-900">
          {values.labelEn || t('untitledMethod')}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {values.labelPt || t('untitledMethodPt')}
        </p>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {t('previewValueLabel')}
          </p>
          <p className="mt-1 break-all text-sm font-medium text-slate-800">
            {values.value || t('noValueYet')}
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('sidebarSortOrder')}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {values.sortOrder}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('sidebarIcon')}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {iconLabelKey ? t(iconLabelKey as never) : t('noIconYet')}
            </p>
          </div>
        </div>

        {values.type === 'SOCIAL' ? (
          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('sidebarPlatform')}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {platformLabelKey ? t(platformLabelKey as never) : t('noValueYet')}
            </p>
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">
          {t('livePreviewTitle')}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {t('livePreviewDescription')}
        </p>

        <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                {values.labelEn || t('untitledMethod')}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {values.labelPt || t('untitledMethodPt')}
              </p>
            </div>

            <ContactMethodTypeBadge type={values.type} />
          </div>

          <p className="mt-4 break-all text-sm text-slate-700">
            {values.value || t('noValueYet')}
          </p>

          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center rounded-xl border border-[var(--color-primary)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-slate-50"
            >
              {t('openPreviewAction')}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}