export const ANALYTICS_RANGE_OPTIONS = [7, 30, 90] as const;

export type AnalyticsRangeDays = (typeof ANALYTICS_RANGE_OPTIONS)[number];

export const DEFAULT_ANALYTICS_RANGE_DAYS: AnalyticsRangeDays = 30;
