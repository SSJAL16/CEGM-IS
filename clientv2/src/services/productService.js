import api from "./api";

const productService = {
  create: (data) => api.post("/products", data),
};

export default productService;
