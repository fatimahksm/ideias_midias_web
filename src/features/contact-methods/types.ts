export type ContactMethodType = 'PHONE' | 'WHATSAPP' | 'EMAIL' | 'SOCIAL';

export type ContactMethodResponse = {
  id: number;
  type: ContactMethodType;
  labelPt: string;
  labelEn: string;
  value: string;
  iconName?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ContactMethodPayload = {
  type: ContactMethodType;
  labelPt: string;
  labelEn: string;
  value: string;
  iconName?: string | null;
  sortOrder: number;
  isActive: boolean;
};