export const endpoints = {
  auth: {
    adminLogin: '/api/admin/auth/login',
    adminMe: '/api/admin/auth/me'
  },
  public: {
    themeSettings: '/api/public/theme-settings',
    siteSettings: '/api/public/site-settings',
    homeCards: '/api/public/home-cards',
    contactMethods: '/api/public/contact-methods',

    sections: '/api/public/sections',
    sectionBySlug: (slug: string) => `/api/public/sections/${slug}`,
    sectionContentBlocks: (sectionId: number) =>
      `/api/public/sections/${sectionId}/content-blocks`,
    sectionCategories: (sectionId: number) =>
      `/api/public/sections/${sectionId}/categories`,
    sectionItems: (sectionId: number) =>
      `/api/public/sections/${sectionId}/items`,

    portfolioSectionProjects: (sectionId: number) =>
      `/api/public/portfolio/sections/${sectionId}/projects`,
    portfolioFeaturedProjects: (sectionId: number) =>
      `/api/public/portfolio/sections/${sectionId}/projects/featured`,

    itemById: (itemId: number) => `/api/public/items/${itemId}`,
    itemMedia: (itemId: number) => `/api/public/items/${itemId}/media`,

    portfolioProjectById: (projectId: number) =>
      `/api/public/portfolio/projects/${projectId}`,
    portfolioProjectMedia: (projectId: number) =>
      `/api/public/portfolio/projects/${projectId}/media`
  },
  admin: {
    siteSettings: '/api/admin/site-settings',
    themeSettings: '/api/admin/theme-settings',
    mediaLibrary: '/api/admin/media-library',
    mediaUpload: '/api/admin/media-library/upload',
    sections: '/api/admin/sections',
    categories: '/api/admin/categories',
    items: '/api/admin/items',
    itemMedia: '/api/admin/item-media',
    homeCards: '/api/admin/home-cards',
    contactMethods: '/api/admin/contact-methods',
    contentBlocks: '/api/admin/content-blocks',
    portfolioProjects: '/api/admin/portfolio-projects',
    portfolioProjectMedia: '/api/admin/portfolio-project-media'
  }
} as const;