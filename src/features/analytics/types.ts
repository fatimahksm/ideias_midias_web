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
  viewsThisMonth: number;
  viewsAllTime: number;
  uniqueVisitorsToday: number;
  uniqueVisitorsThisMonth: number;
  dailySeries: DailyPoint[];
  topSections: TopSection[];
};
