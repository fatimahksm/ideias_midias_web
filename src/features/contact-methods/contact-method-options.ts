import {
  Phone,
  MessageCircle,
  Mail,
  Instagram,
  Facebook,
  Linkedin,
  Globe,
  Youtube,
  Music2,
  type LucideIcon
} from 'lucide-react';
import type {ContactMethodType} from './types';

export type ContactIconOption = {
  value: string;
  labelKey: string;
  icon: LucideIcon;
};

export const CONTACT_ICON_OPTIONS: ContactIconOption[] = [
  {value: 'phone', labelKey: 'icons.phone', icon: Phone},
  {value: 'message-circle', labelKey: 'icons.messageCircle', icon: MessageCircle},
  {value: 'mail', labelKey: 'icons.mail', icon: Mail},
  {value: 'instagram', labelKey: 'icons.instagram', icon: Instagram},
  {value: 'facebook', labelKey: 'icons.facebook', icon: Facebook},
  {value: 'linkedin', labelKey: 'icons.linkedin', icon: Linkedin},
  {value: 'youtube', labelKey: 'icons.youtube', icon: Youtube},
  {value: 'tiktok', labelKey: 'icons.tiktok', icon: Music2},
  {value: 'globe', labelKey: 'icons.globe', icon: Globe}
];

export const SOCIAL_PLATFORM_OPTIONS = [
  {
    value: 'instagram',
    labelKey: 'socialPlatforms.instagram',
    suggestedIcon: 'instagram'
  },
  {
    value: 'facebook',
    labelKey: 'socialPlatforms.facebook',
    suggestedIcon: 'facebook'
  },
  {
    value: 'linkedin',
    labelKey: 'socialPlatforms.linkedin',
    suggestedIcon: 'linkedin'
  },
  {
    value: 'youtube',
    labelKey: 'socialPlatforms.youtube',
    suggestedIcon: 'youtube'
  },
  {
    value: 'tiktok',
    labelKey: 'socialPlatforms.tiktok',
    suggestedIcon: 'tiktok'
  },
  {
    value: 'website',
    labelKey: 'socialPlatforms.website',
    suggestedIcon: 'globe'
  }
] as const;

export type SocialPlatformValue =
  (typeof SOCIAL_PLATFORM_OPTIONS)[number]['value'];

export function getSuggestedIconForType(type: ContactMethodType) {
  switch (type) {
    case 'PHONE':
      return 'phone';
    case 'WHATSAPP':
      return 'message-circle';
    case 'EMAIL':
      return 'mail';
    case 'SOCIAL':
      return 'globe';
    default:
      return '';
  }
}