import axios from 'axios';
import { getStoredSession, clearStoredSession } from '../context/AuthContext';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Reads token from sessionStorage — no route-based logic, no localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const session = getStoredSession();
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
      if (session?.userId) {
        config.headers['x-user-id'] = session.userId;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Handles 401 (expired/invalid token) → clear session + redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      const session = getStoredSession();
      const role = session?.role;
      clearStoredSession();

      // Redirect to the correct portal login
      if (role === 'EMPLOYER') {
        window.location.href = '/employer/login';
      } else if (role && ['SUPER_ADMIN', 'CONTENT_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
        window.location.href = '/';
      } else {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// 1. FILE UPLOAD FUNCTIONS
// ==========================================

export const uploadFile = async (formData: FormData) => {
  const response = await api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const uploadGenericImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const uploadResume = async (userId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/nurse/upload', formData, {
    headers: {
      'x-user-id': userId,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadAvatar = async (userId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/nurse/upload-avatar', formData, {
    headers: {
      'x-user-id': userId,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// ==========================================
// 2. USER, PROFILE & DASHBOARD
// ==========================================

export const findUserByEmail = async (email: string) => {
  const response = await api.get(`/users/${email}`);
  return response.data;
};

export const getDashboardData = async (userId: string) => {
  const response = await api.get(`/users/dashboard/${userId}`);
  return response.data;
};

export const updateNurseProfile = async (userId: string, data: any) => {
  const response = await api.put('/nurse/profile', data, {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await api.delete(`/users/admin/${userId}`);
  return response.data;
};

export const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
  const response = await api.put('/users/change-password', { oldPassword, newPassword }, {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

export const getNursePublicProfile = async (id: string) => {
  const response = await api.get(`/nurse/profile/${id}`);
  return response.data;
};

// ==========================================
// 3. APPLICATIONS, JOBS & SAVED ITEMS
// ==========================================

export const getMyApplications = async (userId: string) => {
  const response = await api.get('/applications/me', {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

export const deleteApplication = async (userId: string, applicationId: string) => {
  const response = await api.delete(`/applications/${applicationId}`, {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

export const getJobs = async (filters: any = {}) => {
  const response = await api.get('/jobs', { params: filters });
  return response.data;
};

export const getJobBySlug = async (slug: string) => {
  const response = await api.get(`/jobs/${slug}`);
  return response.data;
};

export const getSavedJobs = async (userId: string) => {
  const response = await api.get('/jobs/saved', {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

export const deleteSavedJob = async (userId: string, savedJobId: string) => {
  const response = await api.delete(`/jobs/saved/${savedJobId}`, {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

export const getRecommendedJobs = async (userId: string) => {
  const response = await api.get('/jobs/recommended', {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

export const getCompanies = async (params: any = {}) => {
  const response = await api.get('/companies', { params });
  return response.data;
};

export const getSavedCompanies = async (userId: string) => {
  const response = await api.get('/companies/saved', {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

export const deleteSavedCompany = async (userId: string, savedCompanyId: string) => {
  const response = await api.delete(`/companies/saved/${savedCompanyId}`, {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

// ==========================================
// 4. MESSAGING & COMMUNITY
// ==========================================

export const getConversations = async (userId: string) => {
  const response = await api.get('/conversations', {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

export const getMessages = async (userId: string, conversationId: string) => {
  const response = await api.get(`/conversations/${conversationId}/messages`, {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

export const sendMessage = async (userId: string, conversationId: string, content: string) => {
  const response = await api.post(`/conversations/${conversationId}/messages`, { content }, {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

export const deleteConversation = async (userId: string, conversationId: string) => {
  const response = await api.delete(`/conversations/${conversationId}`, {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

export const getGlobalChat = async (userId: string) => {
  const response = await api.get('/community/chat/global', {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

export const getCommunityPosts = async (userId: string) => {
  const response = await api.get('/community/posts', {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

export const createCommunityPost = async (userId: string, title: string, content: string) => {
  const response = await api.post('/community/posts', { title, content }, {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

export const getCommunityPostDetails = async (userId: string, postId: string) => {
  const response = await api.get(`/community/posts/${postId}`, {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

// ==========================================
// 5. BLOG MANAGEMENT (Public & Admin)
// ==========================================

export const getActiveBlogs = async () => {
  const response = await api.get('/blog');
  return response.data;
};

export const getBlogBySlug = async (slug: string | string[] | undefined) => {
  if (!slug) return null;
  const rawSlug = Array.isArray(slug) ? slug[0] : slug;
  const cleanSlug = rawSlug.trim().replace(/^-+|-+$/g, '');
  const response = await api.get(`/blog/${cleanSlug}`);
  return response.data;
};

export const getAdminBlogs = async () => {
  const response = await api.get('/admin/blogs');
  return response.data;
};

export const getBlogById = async (id: string) => {
  const response = await api.get(`/admin/blogs/${id}`);
  return response.data;
};

export const createBlog = async (data: any) => {
  const response = await api.post('/admin/blogs', data);
  return response.data;
};

export const updateBlog = async (id: string, data: any) => {
  const response = await api.patch(`/admin/blogs/${id}`, data);
  return response.data;
};

export const deleteBlog = async (id: string) => {
  const response = await api.delete(`/admin/blogs/${id}`);
  return response.data;
};

// ==========================================
// 6. PRICING & SUBSCRIPTIONS
// ==========================================

export const getActivePlans = async () => {
  const response = await api.get('/subscriptions/plans');
  return response.data;
};

export const getAdminSubscriptions = async () => {
  const response = await api.get('/admin/subscriptions/list');
  return response.data;
};

export const getAdminPlans = async () => {
  const response = await api.get('/admin/subscriptions/plans');
  return response.data;
};

export const updateSubscriptionPlan = async (id: string, data: any) => {
  const response = await api.patch(`/admin/subscriptions/plans/${id}`, data);
  return response.data;
};

export const createSubscriptionPlan = async (data: any) => {
  const response = await api.post('/admin/subscriptions/plans', data);
  return response.data;
};

export const deleteSubscriptionPlan = async (id: string) => {
  const response = await api.delete(`/admin/subscriptions/plans/${id}`);
  return response.data;
};

export const modifySubscription = async (id: string, data: any) => {
  const response = await api.post(`/admin/subscriptions/${id}/modify`, data);
  return response.data;
};

// ==========================================
// 7. ADMIN MANAGEMENT (Companies, Jobs, Users)
// ==========================================

export const getAdminCompanies = async () => {
  const response = await api.get('/companies/admin/list');
  return response.data;
};

export const getAdminCompanyDetails = async (companyId: string) => {
  const response = await api.get(`/companies/admin/${companyId}`);
  return response.data;
};

export const updateCompanyStatus = async (companyId: string, status: string) => {
  const response = await api.post(`/companies/admin/${companyId}/status`, { status });
  return response.data;
};

export const deleteAdminCompany = async (companyId: string) => {
  const response = await api.delete(`/companies/admin/${companyId}`);
  return response.data;
};

export const toggleCompanyFeatured = async (companyId: string) => {
  const response = await api.post(`/companies/admin/${companyId}/toggle-featured`);
  return response.data;
};

export const getAdminJobs = async () => {
  const response = await api.get('/jobs/admin/list');
  return response.data;
};

export const updateJobStatus = async (jobId: string, status: string) => {
  const response = await api.post(`/jobs/admin/${jobId}/status`, { status });
  return response.data;
};

export const getAdminNurses = async () => {
  const response = await api.get('/users/admin/nurses');
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get('/users/admin/admins');
  return response.data;
};

export const updateUserRole = async (userId: string, role: string) => {
  const response = await api.post(`/users/admin/${userId}/role`, { role });
  return response.data;
};

export const updateUserStatus = async (userId: string, status: string) => {
  const response = await api.post(`/users/admin/${userId}/status`, { status });
  return response.data;
};


// ==========================================
// 8. NEWSLETTER, STATS & MISC
// ==========================================

export const getAdminSubscribers = async () => {
  const response = await api.get('/admin/newsletter/subscribers');
  return response.data;
};

export const sendNewsletter = async (data: any) => {
  const response = await api.post('/admin/newsletter/send', data);
  return response.data;
};

export const getNewsletterHistory = async () => {
  const response = await api.get('/admin/newsletter/history');
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const submitContact = async (data: { name: string; email: string; subject: string; phone?: string; message: string }) => {
  const response = await api.post('/contact', data);
  return response.data;
};

// ==========================================
// 9. NOTIFICATIONS
// ==========================================

export const getNotifications = async (userId: string) => {
  const response = await api.get('/notifications', {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

export const markNotificationRead = async (notificationId: string, userId: string) => {
  const response = await api.patch(`/notifications/${notificationId}/read`, {}, {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

export const markAllNotificationsRead = async (userId: string) => {
  const response = await api.post('/notifications/read-all', {}, {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

export const getNotificationDetail = async (notificationId: string, userId: string) => {
  const response = await api.get(`/notifications/${notificationId}/detail`, {
    headers: { 'x-user-id': userId }
  });
  return response.data;
};

export default api;