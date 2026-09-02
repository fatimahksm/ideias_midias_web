'use client';

import {useLocale} from 'next-intl';
import type {TopSection} from '../types';

type Props = {
  sections: TopSection[];
  emptyText: string;
  viewsLabel: string;
};

export function TopSectionsList({sections, emptyText, viewsLabel}: Props) {
  const locale = useLocale();

  if (!sections.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }

  const maxViews = Math.max(...sections.map((section) => section.views));

  return (
    <ul className="space-y-3">
      {sections.map((section) => {
        const name = locale === 'pt' ? section.namePt : section.nameEn;
        const widthPercent = maxViews > 0 ? (section.views / maxViews) * 100 : 0;

        return (
          <li key={section.slug} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-900">{name}</span>
              <span className="tabular-nums text-slate-500">
                {section.views} {viewsLabel}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{width: `${widthPercent}%`}}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
