import {createElement} from 'react';
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

/**
 * Resolves the admin's chosen icon name to one of the icon components declared
 * above, falling back to a sensible default for the contact type. Kept out of
 * the component body so the returned value is unambiguously an existing
 * component rather than something built during render.
 */
function resolveContactIcon(
  type: ContactMethodResponse['type'],
  iconName?: string | null
): LucideIcon {
  const normalizedIconName = iconName?.trim().toLowerCase();

  if (normalizedIconName && ICONS_BY_NAME[normalizedIconName]) {
    return ICONS_BY_NAME[normalizedIconName];
  }

  return getFallbackIcon(type);
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
  // createElement, not <Icon />: the icons are module-level constants, but the
  // static-components lint rule cannot see that through the lookup and reads a
  // capitalized local binding in JSX as a component defined during render.
  return createElement(resolveContactIcon(type, iconName), {className});
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