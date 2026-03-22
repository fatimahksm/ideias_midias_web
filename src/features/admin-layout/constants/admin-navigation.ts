export type AdminNavigationKey =
  | 'dashboard'
  | 'siteSettings'
  | 'themeSettings'
  | 'media'
  | 'sections'
  | 'homeCards'
  | 'contactMethods';

export type AdminNavigationItem = {
  key: AdminNavigationKey;
  labelKey: AdminNavigationKey;
  href:
    | '/admin'
    | '/admin/site-settings'
    | '/admin/theme-settings'
    | '/admin/media'
    | '/admin/sections'
    | '/admin/home-cards'
    | '/admin/contact-methods';
};

export const adminNavigation: AdminNavigationItem[] = [
  {
    key: 'dashboard',
    labelKey: 'dashboard',
    href: '/admin'
  },
  {
    key: 'siteSettings',
    labelKey: 'siteSettings',
    href: '/admin/site-settings'
  },
  {
    key: 'themeSettings',
    labelKey: 'themeSettings',
    href: '/admin/theme-settings'
  },
  {
    key: 'media',
    labelKey: 'media',
    href: '/admin/media'
  },
  {
    key: 'sections',
    labelKey: 'sections',
    href: '/admin/sections'
  },
  {
    key: 'homeCards',
    labelKey: 'homeCards',
    href: '/admin/home-cards'
  },
  {
    key: 'contactMethods',
    labelKey: 'contactMethods',
    href: '/admin/contact-methods'
  }
];