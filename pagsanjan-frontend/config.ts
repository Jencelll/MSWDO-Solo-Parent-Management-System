export const API_CONFIG = {
  BASE_URL: '',
  ENDPOINTS: {
    APPLICATIONS: '/api/applications',
    MY_APPLICATION: '/api/applications/my',
    APPLICATIONS_EXISTING: '/api/applications/existing',
    DASHBOARD_RECENT: '/api/dashboard/recent',
    DASHBOARD_BARANGAY: '/api/dashboard/barangay',
    ANALYTICS_DEMOGRAPHICS: '/api/analytics/demographics',
    ANALYTICS_APPLICATION_STATS: '/api/analytics/application-stats',
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      UNIFIED_LOGIN: '/api/auth/unified-login',
      LOGOUT: '/api/auth/logout',
      USER: '/api/auth/user',
      CHANGE_PASSWORD: '/api/auth/change-password',
      UPDATE_PROFILE: '/api/auth/update-profile'
    },
    ADMIN_AUTH: {
      REGISTER: '/api/admin/auth/register',
      LOGIN: '/api/admin/auth/login',
      LOGOUT: '/api/admin/auth/logout',
      USER: '/api/admin/auth/user',
      UPDATE_PROFILE: '/api/admin/auth/update-profile'
    },
    BACKUPS: {
      LIST: '/api/backups',
      CREATE: '/api/backups',
      RESTORE: '/api/backups/restore',
      DOWNLOAD: (filename: string) => `/api/backups/download/${filename}`
    },
    USERS: {
      LIST: '/api/users',
      CREATE: '/api/users',
      UPDATE: (id: string | number) => `/api/users/${id}`,
      DELETE: (id: string | number) => `/api/users/${id}`
    },
    SYSTEM_LOGS: '/api/system-logs'
  }
};
