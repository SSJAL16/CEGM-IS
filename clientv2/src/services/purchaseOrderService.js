import api from "./api";

const purchaseOrderService = {
  getAll: () => api.get("/purchase-orders/low-stock"),
  create: (data) => api.post("/purchase-orders", data),
  getAllPO: () => api.get("/purchase-orders"),
  getPO: (id) => api.put(`/purchase-orders/${id}`),
  getAllArchivedPO: () => api.get("/purchase-orders/archived"),
  update: (id, data) => api.put(`/purchase-orders/${id}`, data),
  archive: (id) => api.put(`/purchase-orders/archive/${id}`),
  delete: (id) => api.delete(`/purchase-orders/${id}`), 
  getReport: (params) => api.get("/purchase-orders/report", { params }),
  retrieve: (id) => api.put(`/purchase-orders/retrieve/${id}`),
};

export default purchaseOrderService;
