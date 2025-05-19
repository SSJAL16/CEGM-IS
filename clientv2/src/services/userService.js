import api from "./api";

const userService = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  approveUser: (id) => api.patch(`/users/${id}/approve`),
  rejectUser: (id) => api.patch(`/users/${id}/reject`),
  getPendingUsers: () => api.get("/users/pending"),
};

export default userService;
