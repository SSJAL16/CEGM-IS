import api from "./api";

const rmaService = {
  create: (data) => api.post("/rmas", data),
  getAll: () => api.get("/rmas"),
  getAllArchived: () => api.get("/rmas/archived"),
  update: (id, data) => api.put(`/rmas/${id}`, data),
  archive: (id) => api.put(`/rmas/archive/${id}`),
  delete: (id) => api.delete(`/rmas/${id}`), 
  getReport: (params) => api.get("/rmas/report", { params }),
  retrieve: (id) => api.put(`/rmas/retrieve/${id}`),
};

export default rmaService;
