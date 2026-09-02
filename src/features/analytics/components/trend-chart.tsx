'use client';

import {useCallback, useMemo, useState} from 'react';
import {useLocale} from 'next-intl';
import type {DailyPoint} from '../types';

type Props = {
  data: DailyPoint[];
  viewsLabel: string;
  uniqueVisitorsLabel: string;
  emptyText: string;
};

const WIDTH = 720;
const HEIGHT = 260;
const PADDING = {top: 16, right: 16, bottom: 28, left: 36};

const VIEWS_COLOR = '#059669'; // emerald-600
const VISITORS_COLOR = '#2563eb'; // blue-600

function niceMax(value: number) {
  if (value <= 0) return 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const steps = [1, 2, 2.5, 5, 10];
  const step = steps.find((s) => normalized <= s) ?? 10;
  return step * magnitude;
}

function formatShortDate(iso: string, locale: string) {
  const date = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat(locale, {month: 'short', day: 'numeric'}).format(
    date
  );
}

export function TrendChart({
  data,
  viewsLabel,
  uniqueVisitorsLabel,
  emptyText
}: Props) {
  const locale = useLocale();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const maxValue = useMemo(() => {
    const max = data.reduce(
      (acc, point) => Math.max(acc, point.views, point.uniqueVisitors),
      0
    );
    return niceMax(max);
  }, [data]);

  const xFor = useCallback(
    (index: number) =>
      data.length <= 1
        ? PADDING.left
        : PADDING.left + (index / (data.length - 1)) * plotWidth,
    [data.length, plotWidth]
  );

  const yFor = useCallback(
    (value: number) => PADDING.top + plotHeight - (value / maxValue) * plotHeight,
    [maxValue, plotHeight]
  );

  const viewsPath = useMemo(
    () =>
      data
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index)} ${yFor(point.views)}`)
        .join(' '),
    [data, xFor, yFor]
  );

  const visitorsPath = useMemo(
    () =>
      data
        .map(
          (point, index) =>
            `${index === 0 ? 'M' : 'L'} ${xFor(index)} ${yFor(point.uniqueVisitors)}`
        )
        .join(' '),
    [data, xFor, yFor]
  );

  const areaPath = useMemo(() => {
    if (!data.length) return '';
    const top = data
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index)} ${yFor(point.views)}`)
      .join(' ');
    const baseY = PADDING.top + plotHeight;
    return `${top} L ${xFor(data.length - 1)} ${baseY} L ${xFor(0)} ${baseY} Z`;
  }, [data, xFor, yFor, plotHeight]);

  const yTicks = [0, 0.5, 1].map((fraction) => Math.round(maxValue * fraction));

  if (!data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const ratio = (relativeX - PADDING.left) / plotWidth;
    const index = Math.round(ratio * (data.length - 1));
    setHoverIndex(Math.min(data.length - 1, Math.max(0, index)));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-0.5 w-4 rounded-full"
            style={{backgroundColor: VIEWS_COLOR}}
          />
          {viewsLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-0.5 w-4 rounded-full"
            style={{backgroundColor: VISITORS_COLOR}}
          />
          {uniqueVisitorsLabel}
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full touch-none"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={yFor(tick)}
                y2={yFor(tick)}
                stroke="#e2e8f0"
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 8}
                y={yFor(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-slate-400 text-[10px]"
              >
                {tick}
              </text>
            </g>
          ))}

          <path d={areaPath} fill={VIEWS_COLOR} fillOpacity={0.1} stroke="none" />

          <path
            d={visitorsPath}
            fill="none"
            stroke={VISITORS_COLOR}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={viewsPath}
            fill="none"
            stroke={VIEWS_COLOR}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* End markers with a surface ring */}
          <circle
            cx={xFor(data.length - 1)}
            cy={yFor(data[data.length - 1].views)}
            r={4}
            fill={VIEWS_COLOR}
            stroke="#ffffff"
            strokeWidth={2}
          />
          <circle
            cx={xFor(data.length - 1)}
            cy={yFor(data[data.length - 1].uniqueVisitors)}
            r={4}
            fill={VISITORS_COLOR}
            stroke="#ffffff"
            strokeWidth={2}
          />

          {hoverIndex !== null ? (
            <>
              <line
                x1={xFor(hoverIndex)}
                x2={xFor(hoverIndex)}
                y1={PADDING.top}
                y2={PADDING.top + plotHeight}
                stroke="#94a3b8"
                strokeWidth={1}
              />
              <circle
                cx={xFor(hoverIndex)}
                cy={yFor(data[hoverIndex].views)}
                r={4}
                fill={VIEWS_COLOR}
                stroke="#ffffff"
                strokeWidth={2}
              />
              <circle
                cx={xFor(hoverIndex)}
                cy={yFor(data[hoverIndex].uniqueVisitors)}
                r={4}
                fill={VISITORS_COLOR}
                stroke="#ffffff"
                strokeWidth={2}
              />
            </>
          ) : null}
        </svg>

        {hovered ? (
          <div
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg"
            style={{
              left: `${(xFor(hoverIndex as number) / WIDTH) * 100}%`
            }}
          >
            <p className="mb-1 font-semibold text-slate-900">
              {formatShortDate(hovered.date, locale)}
            </p>
            <p className="flex items-center gap-2">
              <span
                className="inline-block h-0.5 w-3 rounded-full"
                style={{backgroundColor: VIEWS_COLOR}}
              />
              <span className="font-semibold text-slate-900">{hovered.views}</span>
              <span className="text-slate-500">{viewsLabel}</span>
            </p>
            <p className="flex items-center gap-2">
              <span
                className="inline-block h-0.5 w-3 rounded-full"
                style={{backgroundColor: VISITORS_COLOR}}
              />
              <span className="font-semibold text-slate-900">
                {hovered.uniqueVisitors}
              </span>
              <span className="text-slate-500">{uniqueVisitorsLabel}</span>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
