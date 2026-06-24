export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

export type AdminNavigationKey =
  | 'dashboard'
  | 'siteSettings'
  | 'homeCards'
  | 'sections'
  | 'media'
  | 'contactMethods'
  | 'themeSettings'
  | 'adminUsers';

// Groups let the sidebar read as a few clear areas instead of one long list.
export type AdminNavigationGroup =
  | 'overview'
  | 'content'
  | 'appearance'
  | 'system';

export type AdminNavigationItem = {
  key: AdminNavigationKey;
  labelKey: AdminNavigationKey;
  group: AdminNavigationGroup;
  href:
    | '/admin'
    | '/admin/site-settings'
    | '/admin/home-cards'
    | '/admin/sections'
    | '/admin/media'
    | '/admin/contact-methods'
    | '/admin/theme-settings'
    | '/admin/users';
  visibleFor?: AdminRole[];
};

// Render order of the sidebar groups.
export const adminNavigationGroups: AdminNavigationGroup[] = [
  'overview',
  'content',
  'appearance',
  'system'
];

export const adminNavigation: AdminNavigationItem[] = [
  {
    key: 'dashboard',
    labelKey: 'dashboard',
    group: 'overview',
    href: '/admin'
  },
  {
    key: 'siteSettings',
    labelKey: 'siteSettings',
    group: 'content',
    href: '/admin/site-settings'
  },
  {
    key: 'homeCards',
    labelKey: 'homeCards',
    group: 'content',
    href: '/admin/home-cards'
  },
  {
    key: 'sections',
    labelKey: 'sections',
    group: 'content',
    href: '/admin/sections'
  },
  {
    key: 'media',
    labelKey: 'media',
    group: 'content',
    href: '/admin/media'
  },
  {
    key: 'contactMethods',
    labelKey: 'contactMethods',
    group: 'content',
    href: '/admin/contact-methods'
  },
  {
    key: 'themeSettings',
    labelKey: 'themeSettings',
    group: 'appearance',
    href: '/admin/theme-settings'
  },
  {
    key: 'adminUsers',
    labelKey: 'adminUsers',
    group: 'system',
    href: '/admin/users',
    visibleFor: ['SUPER_ADMIN']
  }
];
