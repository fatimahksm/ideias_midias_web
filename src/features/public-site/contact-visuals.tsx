import {
  Globe,
  Mail,
  MessageCircle,
  Phone,
  type LucideIcon
} from 'lucide-react';
import {CONTACT_ICON_OPTIONS} from '@/features/contact-methods/contact-method-options';
import type {ContactMethodResponse} from '@/features/contact-methods/types';

const ICONS_BY_NAME = Object.fromEntries(
  CONTACT_ICON_OPTIONS.map((option) => [option.value, option.icon])
) as Record<string, LucideIcon>;

function getFallbackIcon(type: ContactMethodResponse['type']): LucideIcon {
  switch (type) {
    case 'PHONE':
      return Phone;
    case 'WHATSAPP':
      return MessageCircle;
    case 'EMAIL':
      return Mail;
    default:
      return Globe;
  }
}

export function PublicContactIcon({
  type,
  iconName,
  className = 'h-5 w-5'
}: {
  type: ContactMethodResponse['type'];
  iconName?: string | null;
  className?: string;
}) {
  const normalizedIconName = iconName?.trim().toLowerCase() || '';
  const Icon =
    (normalizedIconName && ICONS_BY_NAME[normalizedIconName]) ||
    getFallbackIcon(type);

  return <Icon className={className} />;
}

export function getPublicContactDisplayValue(
  item: Pick<ContactMethodResponse, 'type' | 'value'>
) {
  const value = item.value.trim();

  if (!value) return '';

  if (item.type !== 'SOCIAL') {
    return value;
  }

  try {
    const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const parsed = new URL(normalized);

    const host = parsed.hostname.replace(/^www\./i, '');
    const path = parsed.pathname.replace(/\/$/, '');

    return path && path !== '/' ? `${host}${path}` : host;
  } catch {
    return value
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/$/, '');
  }
}