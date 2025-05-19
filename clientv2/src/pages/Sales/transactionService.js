import api from "./api";

const transactionService = {
  getTransaction: (transactionId) => api.get(`/getTransaction/${transactionId}`),
  getRefund: (transactionId) => api.get(`/getRefund/${transactionId}`),
  getReplace: (transactionId) => api.get(`/getReplace/${transactionId}`),
  deleteTransaction: (transactionId) => api.delete(`/deleteTransaction/${transactionId}`),
createStockMovement: (data) => api.post("/api/stockMovement", data),
  
  // Sales Transactions
  createSalesTransaction: (data) => api.post("/createSalesTransaction", data),
  
  // Categories
  getCategories: () => api.get("/categories"),
  
  // Products
  getProducts: () => api.get("/products"),
  getProductsByCategory: (category) => api.get(`/productsByCategory/${category}`),
};

export default transactionService;