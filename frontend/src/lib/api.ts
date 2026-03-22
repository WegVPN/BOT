import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (email: string, password: string, nickname: string) =>
    api.post('/api/auth/register', { email, password, nickname }),
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  logout: () => api.post('/api/auth/logout'),
  refreshToken: (refreshToken: string) =>
    api.post('/api/auth/refresh', { refresh_token: refreshToken }),
  getCurrentUser: () => api.get('/api/users/me'),
  updateProfile: (data: { nickname?: string; signature?: string }) =>
    api.patch('/api/users/me', data),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/api/categories'),
  getById: (id: number) => api.get(`/api/categories/${id}`),
};

// Forums API
export const forumsApi = {
  getAll: () => api.get('/api/forums'),
  getByCategory: (categoryId: number) => api.get(`/api/forums/category/${categoryId}`),
  getById: (id: number) => api.get(`/api/forums/${id}`),
};

// Topics API
export const topicsApi = {
  getByForum: (forumId: number, page?: number, limit?: number) =>
    api.get(`/api/topics/forum/${forumId}`, { params: { page, limit } }),
  getById: (id: number, page?: number, limit?: number) =>
    api.get(`/api/topics/${id}`, { params: { page, limit } }),
  create: (title: string, forumId: number, content: string) =>
    api.post('/api/topics', { title, forum_id: forumId, content }),
  search: (query: string, forumId?: number) =>
    api.get('/api/topics/search', { params: { q: query, forumId } }),
  getActive: (limit?: number) => api.get('/api/topics/active', { params: { limit } }),
  subscribe: (id: number) => api.post(`/api/topics/${id}/subscribe`),
  unsubscribe: (id: number) => api.post(`/api/topics/${id}/unsubscribe`),
};

// Posts API
export const postsApi = {
  getById: (id: number) => api.get(`/api/posts/${id}`),
  create: (topicId: number, content: string, parentPostId?: number) =>
    api.post('/api/posts', { topic_id: topicId, content, parent_post_id: parentPostId }),
  update: (id: number, content: string) =>
    api.patch(`/api/posts/${id}`, { content }),
  delete: (id: number) => api.delete(`/api/posts/${id}`),
  like: (id: number) => api.post(`/api/posts/${id}/like`),
  unlike: (id: number) => api.post(`/api/posts/${id}/unlike`),
  getByUser: (userId: number, page?: number, limit?: number) =>
    api.get(`/api/posts/user/${userId}`, { params: { page, limit } }),
};

// Users API
export const usersApi = {
  getById: (id: number) => api.get(`/api/users/${id}`),
  getStats: (id: number) => api.get(`/api/users/${id}/stats`),
  search: (query: string, limit?: number) =>
    api.get(`/api/users/search/${query}`, { params: { limit } }),
};

// Notifications API
export const notificationsApi = {
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  getAll: (page?: number, limit?: number) =>
    api.get('/api/notifications', { params: { page, limit } }),
  markAsRead: (id: number) => api.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/api/notifications/read-all'),
};

// Admin API
export const adminApi = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getUsers: (page?: number, limit?: number) =>
    api.get('/api/admin/users', { params: { page, limit } }),
  banUser: (id: number, reason?: string) =>
    api.post(`/api/admin/users/${id}/ban`, { reason }),
  unbanUser: (id: number) => api.post(`/api/admin/users/${id}/unban`),
  changeUserRole: (id: number, roleId: number) =>
    api.patch(`/api/admin/users/${id}/role`, { role_id: roleId }),
  getRoles: () => api.get('/api/admin/roles'),
  getLogs: (page?: number, limit?: number) =>
    api.get('/api/admin/logs', { params: { page, limit } }),
  closeTopic: (id: number) => api.post(`/api/admin/topics/${id}/close`),
  openTopic: (id: number) => api.post(`/api/admin/topics/${id}/open`),
  pinTopic: (id: number) => api.post(`/api/admin/topics/${id}/pin`),
  unpinTopic: (id: number) => api.post(`/api/admin/topics/${id}/unpin`),
  moveTopic: (id: number, forumId: number) =>
    api.post(`/api/admin/topics/${id}/move`, { forum_id: forumId }),
};

// Upload API
export const uploadApi = {
  uploadFile: (file: File, postId?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (postId) formData.append('post_id', postId.toString());
    
    return api.post('/api/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getFileUrl: (id: number) => api.get(`/api/upload/file/${id}`),
  deleteFile: (id: number) => api.delete(`/api/upload/file/${id}`),
};
