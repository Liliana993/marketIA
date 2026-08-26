import api from "./axios";

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  current: () => api.get("/auth/current"),
  logout: () => api.post("/auth/logout"),
};

export const productsApi = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  getBySku: (sku) => api.get(`/products/sku/${sku}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  updateStock: (id, quantity) => api.put(`/products/${id}/stock`, { quantity }),
  getLowStock: () => api.get("/products/low-stock"),
};

export const categoriesApi = {
  getAll: () => api.get("/categories"),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const salesApi = {
  getAll: (params) => api.get("/sales", { params }),
  getById: (id) => api.get(`/sales/${id}`),
  create: (payload) => api.post("/sales", payload),
  remove: (id) => api.delete(`/sales/${id}`),
  getStats: (params) => api.get("/sales/stats", { params }),
};

export const combosApi = {
  getAll: (params) => api.get("/combos", { params }),
  getById: (id) => api.get(`/combos/${id}`),
  create: (data) => api.post("/combos", data),
  update: (id, data) => api.put(`/combos/${id}`, data),
  delete: (id) => api.delete(`/combos/${id}`),
  suggest: () => api.post("/combos/suggestions"),
  promote: (id, channel) => api.post(`/combos/${id}/promote`, { channel }),
};

export const promotionsApi = {
  getAll: (params) => api.get("/promotions", { params }),
  getById: (id) => api.get(`/promotions/${id}`),
  approve: (id) => api.post(`/promotions/${id}/approve`),
  reject: (id) => api.post(`/promotions/${id}/reject`),
  retry: (id) => api.post(`/promotions/${id}/retry`),
  remove: (id) => api.delete(`/promotions/${id}`),
};

export const assistantApi = {
  sendMessage: (message) => api.post("/assistant", { message }),
  comboSuggestions: () => api.post("/assistant/combo-suggestions"),
  businessAnalysis: () => api.post("/assistant/business-analysis"),
  restockAlerts: () => api.get("/assistant/restock-alerts"),
  marginAnalysis: () => api.get("/assistant/margin-analysis"),
  priceSuggestions: () => api.get("/assistant/price-suggestions"),
  weeklyTrends: () => api.get("/assistant/weekly-trends"),
};

export const dashboardApi = {
  getStats: (todayStart, todayEnd) => api.get("/dashboard/stats", { params: { todayStart, todayEnd } }),
};

export const exportApi = {
  products: (format) => api.get(`/export/products?format=${format}`, { responseType: 'blob' }),
  sales: (format, params) => api.get(`/export/sales?format=${format}`, { params, responseType: 'blob' }),
};
