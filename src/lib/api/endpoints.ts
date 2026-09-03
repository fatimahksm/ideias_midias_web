export const endpoints = {
  auth: {
    adminLogin: '/api/admin/auth/login',
    adminRefresh: '/api/admin/auth/refresh',
    adminLogout: '/api/admin/auth/logout',
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
    sectionItemsPage: (sectionId: number) =>
      `/api/public/sections/${sectionId}/items/page`,

    itemById: (itemId: number) => `/api/public/items/${itemId}`,
    itemMedia: (itemId: number) => `/api/public/items/${itemId}/media`,

    portfolioSectionProjects: (sectionId: number) =>
      `/api/public/portfolio/sections/${sectionId}/projects`,
    portfolioSectionProjectsPage: (sectionId: number) =>
      `/api/public/portfolio/sections/${sectionId}/projects/page`,
    portfolioFeaturedProjects: (sectionId: number) =>
      `/api/public/portfolio/sections/${sectionId}/projects/featured`,
    portfolioProjectById: (projectId: number) =>
      `/api/public/portfolio/projects/${projectId}`,
    portfolioProjectMedia: (projectId: number) =>
      `/api/public/portfolio/projects/${projectId}/media`,

    pageViews: '/api/public/analytics/page-views'
  },

  admin: {
    siteSettings: '/api/admin/site-settings',
    themeSettings: '/api/admin/theme-settings',

    adminUsers: '/api/admin/users',
    sectionAttributes: '/api/admin/section-attributes',

    sections: '/api/admin/sections',
    categories: '/api/admin/categories',
    items: '/api/admin/items',
    itemMedia: '/api/admin/item-media',

    homeCards: '/api/admin/home-cards',
    contactMethods: '/api/admin/contact-methods',
    contentBlocks: '/api/admin/content-blocks',

    portfolioProjects: '/api/admin/portfolio-projects',
    portfolioProjectMedia: '/api/admin/portfolio-media',

    mediaLibrary: '/api/admin/media-library',
    mediaUpload: '/api/admin/media-library/upload',

    dataImportTemplate: '/api/admin/data-import/template',
    dataImportPreview: '/api/admin/data-import/preview',
    dataImportCommit: '/api/admin/data-import/commit',

    analyticsSummary: '/api/admin/analytics/summary',
    statsSummary: '/api/admin/stats/summary'
  }
} as const;