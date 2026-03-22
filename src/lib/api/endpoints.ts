export const endpoints = {
  auth: {
    adminLogin: '/api/admin/auth/login',
    adminMe: '/api/admin/auth/me'
  },
  public: {
    themeSettings: '/api/public/theme-settings',
    siteSettings: '/api/public/site-settings',
    homeCards: '/api/public/home-cards',
    contactMethods: '/api/public/contact-methods'
  },
  admin: {
    siteSettings: '/api/admin/site-settings',
    themeSettings: '/api/admin/theme-settings',
    mediaLibrary: '/api/admin/media-library',
    mediaUpload: '/api/admin/media-library/upload',
    sections: '/api/admin/sections',
    homeCards: '/api/admin/home-cards',
    contactMethods: '/api/admin/contact-methods'
  }
} as const;