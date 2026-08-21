import apiClient from '@/api/apiClient';

function unwrap(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.data !== undefined) return payload.data;
  return payload;
}

const siteContentService = {
  listPublicBlogs: async () => {
    const response = await apiClient.get('/site/blogs', {
      params: { t: Date.now() },
      headers: { 'Cache-Control': 'no-cache' },
    });
    return { ...response.data, data: unwrap(response.data) };
  },
  getPublicBlog: async (id) => {
    const response = await apiClient.get(`/site/blogs/${id}`, {
      params: { t: Date.now() },
      headers: { 'Cache-Control': 'no-cache' },
    });
    return { ...response.data, data: unwrap(response.data) };
  },
  listPublicTestimonials: async () => {
    const response = await apiClient.get('/site/testimonials', {
      params: { t: Date.now() },
      headers: { 'Cache-Control': 'no-cache' },
    });
    return { ...response.data, data: unwrap(response.data) };
  },

  listBlogs: async () => {
    const response = await apiClient.get('/admin/site/blogs', { params: { t: Date.now() } });
    return { ...response.data, data: unwrap(response.data) };
  },
  createBlog: async (payload) => {
    const response = await apiClient.post('/admin/site/blogs', payload);
    return response.data;
  },
  updateBlog: async (id, payload) => {
    const response = await apiClient.patch(`/admin/site/blogs/${id}`, payload);
    return response.data;
  },
  deleteBlog: async (id) => {
    const response = await apiClient.delete(`/admin/site/blogs/${id}`);
    return response.data;
  },

  listTestimonials: async () => {
    const response = await apiClient.get('/admin/site/testimonials', { params: { t: Date.now() } });
    return { ...response.data, data: unwrap(response.data) };
  },
  createTestimonial: async (payload) => {
    const response = await apiClient.post('/admin/site/testimonials', payload);
    return response.data;
  },
  updateTestimonial: async (id, payload) => {
    const response = await apiClient.patch(`/admin/site/testimonials/${id}`, payload);
    return response.data;
  },
  deleteTestimonial: async (id) => {
    const response = await apiClient.delete(`/admin/site/testimonials/${id}`);
    return response.data;
  },

  uploadImage: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const response = await apiClient.post('/admin/site/upload', form);
    return response.data;
  },
};

export default siteContentService;
