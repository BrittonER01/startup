export const API = {
  profile: '/api/profile',

  auth: {
    create: '/api/auth/create',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
  },

  entries: {
    list: '/api/entries',
    create: '/api/entries',
    byId: (id) => `/api/entries/${encodeURIComponent(id)}`,
  },

  friends: {
    list: '/api/friends',
    create: '/api/friends',
    byId: (id) => `/api/friends/${encodeURIComponent(id)}`,
  },
};
