export type DailyPoint = {
  date: string;
  views: number;
  uniqueVisitors: number;
};

export type TopSection = {
  slug: string;
  nameEn: string;
  namePt: string;
  views: number;
};

export type AnalyticsSummaryResponse = {
  viewsToday: number;
  viewsInRange: number;
  viewsAllTime: number;
  uniqueVisitorsToday: number;
  uniqueVisitorsInRange: number;
  rangeDays: number;
  dailySeries: DailyPoint[];
  topSections: TopSection[];
};
