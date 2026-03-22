import {
  Briefcase,
  Building2,
  Globe,
  Image,
  Layers3,
  LayoutGrid,
  Megaphone,
  Palette,
  Phone,
  Shield,
  Sparkles,
  Star,
  type LucideIcon
} from 'lucide-react';

export type HomeCardIconOption = {
  value: string;
  labelKey: string;
  icon: LucideIcon;
};

export const HOME_CARD_ICON_OPTIONS: HomeCardIconOption[] = [
  {value: 'layout-grid', labelKey: 'icons.layoutGrid', icon: LayoutGrid},
  {value: 'layers-3', labelKey: 'icons.layers3', icon: Layers3},
  {value: 'image', labelKey: 'icons.image', icon: Image},
  {value: 'palette', labelKey: 'icons.palette', icon: Palette},
  {value: 'briefcase', labelKey: 'icons.briefcase', icon: Briefcase},
  {value: 'building-2', labelKey: 'icons.building2', icon: Building2},
  {value: 'sparkles', labelKey: 'icons.sparkles', icon: Sparkles},
  {value: 'star', labelKey: 'icons.star', icon: Star},
  {value: 'shield', labelKey: 'icons.shield', icon: Shield},
  {value: 'megaphone', labelKey: 'icons.megaphone', icon: Megaphone},
  {value: 'phone', labelKey: 'icons.phone', icon: Phone},
  {value: 'globe', labelKey: 'icons.globe', icon: Globe}
];

export function getHomeCardIconOption(value?: string | null) {
  if (!value) return undefined;
  return HOME_CARD_ICON_OPTIONS.find((item) => item.value === value);
}