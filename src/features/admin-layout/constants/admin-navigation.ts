export type AdminNavigationKey =
  | 'dashboard'
  | 'siteSettings'
  | 'homeCards'
  | 'sections'
  | 'media'
  | 'contactMethods'
  | 'themeSettings';

export type AdminNavigationItem = {
  key: AdminNavigationKey;
  labelKey: AdminNavigationKey;
  href:
    | '/admin'
    | '/admin/site-settings'
    | '/admin/home-cards'
    | '/admin/sections'
    | '/admin/media'
    | '/admin/contact-methods'
    | '/admin/theme-settings';
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
    key: 'homeCards',
    labelKey: 'homeCards',
    href: '/admin/home-cards'
  },
  {
    key: 'sections',
    labelKey: 'sections',
    href: '/admin/sections'
  },
  {
    key: 'media',
    labelKey: 'media',
    href: '/admin/media'
  },
  {
    key: 'contactMethods',
    labelKey: 'contactMethods',
    href: '/admin/contact-methods'
  },
  {
    key: 'themeSettings',
    labelKey: 'themeSettings',
    href: '/admin/theme-settings'
  }
];