export type AdminNavigationKey =
  | 'dashboard'
  | 'siteSettings'
  | 'themeSettings'
  | 'media'
  | 'sections'
  | 'contentBlocks'
  | 'portfolioProjects'
  | 'categories'
  | 'items'
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
    | '/admin/categories'
    | '/admin/items'
    | '/admin/content-blocks'
    | '/admin/portfolio-projects'
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
    key: 'categories',
    labelKey: 'categories',
    href: '/admin/categories'
  },
   {
  key: 'items',
  labelKey: 'items',
  href: '/admin/items'
},
  {
  key: 'contentBlocks',
  labelKey: 'contentBlocks',
  href: '/admin/content-blocks'
},
{
  key: 'portfolioProjects',
  labelKey: 'portfolioProjects',
  href: '/admin/portfolio-projects'
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
  },
 
];