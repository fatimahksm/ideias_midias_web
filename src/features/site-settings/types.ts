export type HeroBackgroundType = 'IMAGE' | 'VIDEO';

export type SiteSettingsResponse = {
  id?: number;
  companyNamePt: string;
  companyNameEn: string;
  shortIntroPt?: string | null;
  shortIntroEn?: string | null;
  heroTitlePt?: string | null;
  heroTitleEn?: string | null;
  heroSubtitlePt?: string | null;
  heroSubtitleEn?: string | null;
  logoUrl?: string | null;
  heroBackgroundType: HeroBackgroundType;
  heroBackgroundUrl?: string | null;
  companyVideoUrl?: string | null;
  addressPt?: string | null;
  addressEn?: string | null;
  mapEmbedUrl?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type SiteSettingsPayload = {
  companyNamePt: string;
  companyNameEn: string;
  shortIntroPt?: string | null;
  shortIntroEn?: string | null;
  heroTitlePt?: string | null;
  heroTitleEn?: string | null;
  heroSubtitlePt?: string | null;
  heroSubtitleEn?: string | null;
  logoUrl?: string | null;
  heroBackgroundType: HeroBackgroundType;
  heroBackgroundUrl?: string | null;
  companyVideoUrl?: string | null;
  addressPt?: string | null;
  addressEn?: string | null;
  mapEmbedUrl?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
};