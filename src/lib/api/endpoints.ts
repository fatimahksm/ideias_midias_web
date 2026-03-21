export const endpoints = {
  auth: {
    adminLogin: '/api/admin/auth/login',
    adminMe: '/api/admin/auth/me'
  },
  public: {
    themeSettings: '/api/public/theme-settings',
    siteSettings: '/api/public/site-settings'
  },
  admin: {
    siteSettings: '/api/admin/site-settings',
    mediaLibrary: '/api/admin/media-library',
    mediaUpload: '/api/admin/media-library/upload'
  }
} as const;