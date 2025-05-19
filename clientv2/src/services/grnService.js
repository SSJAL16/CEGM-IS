import api from "./api";

const grnService = {
  create: (data) => api.post("/grns", data),
  getAll: () => api.get("/grns"),
  getAllArchived: () => api.get("/grns/archived"),
  update: (id, data) => api.put(`/grns/${id}`, data),
  archive: (id) => api.put(`/grns/archive/${id}`),
  delete: (id) => api.delete(`/grns/${id}`), 
  getReport: (params) => api.get("/grns/report", { params }),
  addQuantity: (product_Id, quantityToAdd) => api.patch("/grns/add-quantity", {product_Id, quantityToAdd,}),
  retrieve: (id) => api.put(`/grns/retrieve/${id}`),
};

export default grnService;
