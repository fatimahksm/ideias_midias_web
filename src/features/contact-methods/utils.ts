import type {
  ContactMethodResponse,
  ContactMethodType
} from './types';
import {
  SOCIAL_PLATFORM_OPTIONS,
  type SocialPlatformValue
} from './contact-method-options';

export function emptyToNull(value?: string | null) {
  if (value == null) return null;

  const trimmed = value.trim();

  return trimmed.length ? trimmed : null;
}

export function getNextContactMethodSortOrder(items: ContactMethodResponse[]) {
  if (!items.length) return 1;

  const max = items.reduce((acc, item) => {
    return Math.max(acc, Number(item.sortOrder) || 0);
  }, 0);

  return max + 1;
}

export function normalizePhoneLikeValue(value: string) {
  return value.replace(/\s+/g, '').trim();
}

export function detectSocialPlatform(value: string): SocialPlatformValue {
  const normalized = value.trim().toLowerCase();

  if (normalized.includes('instagram')) return 'instagram';
  if (normalized.includes('facebook')) return 'facebook';
  if (normalized.includes('linkedin')) return 'linkedin';
  if (normalized.includes('youtube')) return 'youtube';
  if (normalized.includes('tiktok')) return 'tiktok';

  return 'website';
}

export function getSuggestedSocialIcon(
  platform: SocialPlatformValue
): string {
  return (
    SOCIAL_PLATFORM_OPTIONS.find((item) => item.value === platform)
      ?.suggestedIcon || 'globe'
  );
}

export function getContactHref(
  type: ContactMethodType,
  value: string
): string | null {
  const trimmed = value.trim();

  if (!trimmed) return null;

  if (type === 'PHONE') {
    return `tel:${normalizePhoneLikeValue(trimmed)}`;
  }

  if (type === 'WHATSAPP') {
    const normalized = normalizePhoneLikeValue(trimmed).replace(/^\+/, '');
    return `https://wa.me/${normalized}`;
  }

  if (type === 'EMAIL') {
    return `mailto:${trimmed}`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}