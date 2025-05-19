import api from "./api";

const replaceService = {
  getTransaction: (transactionId) => api.get(`/getTransaction/${transactionId}`),
  createReplace: (transactionId, data) => api.put(`/createReplaceTransaction/${transactionId}`, data),
};

export default replaceService;