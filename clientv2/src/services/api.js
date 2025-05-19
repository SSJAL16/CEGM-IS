import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development" ? "https://cegm-backend.onrender.com/api" : "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
