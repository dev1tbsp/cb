import { api } from '@/src/api/client';

// Admin API surface
export const adminApi = {
  stats: () => api.get('/admin/stats'),

  // Quotes
  listQuotes: (status?: string) => api.get(`/admin/quotes${status ? `?status_filter=${status}` : ''}`),
  updateQuoteStatus: (id: string, status: string) => api.put(`/admin/quotes/${id}`, { status }),
  deleteQuote: (id: string) => api.del(`/admin/quotes/${id}`),

  // Inquiries
  listInquiries: () => api.get('/admin/inquiries'),
  updateInquiry: (id: string, patch: { status?: string; reply?: string }) =>
    api.put(`/admin/inquiries/${id}`, patch),
  deleteInquiry: (id: string) => api.del(`/admin/inquiries/${id}`),

  // Menu CRUD
  createMenu: (body: any) => api.post('/admin/menu', body),
  updateMenu: (id: string, body: any) => api.put(`/admin/menu/${id}`, body),
  deleteMenu: (id: string) => api.del(`/admin/menu/${id}`),

  // Services CRUD
  createService: (body: any) => api.post('/admin/services', body),
  updateService: (id: string, body: any) => api.put(`/admin/services/${id}`, body),
  deleteService: (id: string) => api.del(`/admin/services/${id}`),

  // Portfolio CRUD
  createPortfolio: (body: any) => api.post('/admin/portfolio', body),
  updatePortfolio: (id: string, body: any) => api.put(`/admin/portfolio/${id}`, body),
  deletePortfolio: (id: string) => api.del(`/admin/portfolio/${id}`),

  // Testimonials CRUD
  createTestimonial: (body: any) => api.post('/admin/testimonials', body),
  updateTestimonial: (id: string, body: any) => api.put(`/admin/testimonials/${id}`, body),
  deleteTestimonial: (id: string) => api.del(`/admin/testimonials/${id}`),

  // Clients CRUD
  createClient: (body: any) => api.post('/admin/corporate-clients', body),
  updateClient: (id: string, body: any) => api.put(`/admin/corporate-clients/${id}`, body),
  deleteClient: (id: string) => api.del(`/admin/corporate-clients/${id}`),

  // Media upload — body { data_url, label }
  uploadMedia: (data_url: string, label?: string) =>
    api.post('/admin/media', { data_url, label }),
};

// Pick a file (web only) and return its data URL.
// On native we just return null — admin panel is web-first.
export async function pickImageDataUrl(): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    input.click();
  });
}
