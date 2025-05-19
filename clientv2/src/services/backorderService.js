import api from "./api";

const backorderService = {
  getBackorderProducts: () => api.get("/backorders/products"),
  create: (data) => api.post("/backorders", data),
  getAll: () => api.get("/backorders"),
  getAllArchived: () => api.get("/backorders/archived"),
  update: (id, data) => api.put(`/backorders/${id}`, data),
  archive: (id) => api.put(`/backorders/archive/${id}`),
  delete: (id) => api.delete(`/backorders/${id}`), 
  getReport: (params) => api.get("/backorders/report", { params }),
  retrieve: (id) => api.put(`/backorders/retrieve/${id}`),
};

export default backorderService;
