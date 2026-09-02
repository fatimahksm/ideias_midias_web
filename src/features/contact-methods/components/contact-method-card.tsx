'use client';

import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {ActionMenu} from '@/components/ui/action-menu';
import {Button} from '@/components/ui/button';
import {formatMediaDate} from '@/features/media-library/utils';
import type {ContactMethodResponse} from '../types';
import {getContactHref} from '../utils';
import {ContactMethodTypeBadge} from './contact-method-type-badge';

type Props = {
  item: ContactMethodResponse;
  canDelete: boolean;
  isDeleting: boolean;
  onDelete: (item: ContactMethodResponse) => void;
};

const linkClassName =
  'inline-flex h-9 items-center justify-center rounded-xl border border-[var(--color-primary)] bg-white px-3 text-sm font-medium text-[var(--color-primary)] transition hover:bg-slate-50';

export function ContactMethodCard({
  item,
  canDelete,
  isDeleting,
  onDelete
}: Props) {
  const t = useTranslations('ContactMethodsManager');
  const common = useTranslations('Common');
  const locale = useLocale();

  const href = getContactHref(item.type, item.value);

  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <ContactMethodTypeBadge type={item.type} />

            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                item.isActive
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-100 text-slate-700'
              }`}
            >
              {item.isActive ? t('statusActive') : t('statusInactive')}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {item.labelEn}
            </h3>
            <p className="text-sm text-slate-500">{item.labelPt}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-100 px-3 py-2 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {t('sortOrder')}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {item.sortOrder}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {t('valueLabel')}
          </p>
          <p className="mt-1 break-all text-sm text-slate-800">{item.value}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {t('iconNameLabel')}
          </p>
          <p className="mt-1 text-sm text-slate-800">
            {item.iconName || t('noIcon')}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-slate-50 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {t('updatedAt')}
        </p>
        <p className="mt-1 text-sm text-slate-700">
          {formatMediaDate(item.updatedAt, locale)}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link href={`/admin/contact-methods/${item.id}/edit`} className="grow sm:grow-0">
          <Button type="button" className="w-full sm:w-auto">
            {common('edit')}
          </Button>
        </Link>

        <ActionMenu
          label={common('moreActions')}
          items={[
            ...(href
              ? [{key: 'open', label: t('openContact'), href, external: true}]
              : []),
            ...(canDelete
              ? [
                  {
                    key: 'delete',
                    label: isDeleting ? common('loading') : common('delete'),
                    tone: 'danger' as const,
                    disabled: isDeleting,
                    onSelect: () => onDelete(item)
                  }
                ]
              : [])
          ]}
        />
      </div>
    </article>
  );
}