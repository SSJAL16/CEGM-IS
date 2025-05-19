import { create } from "zustand";
import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development" ? "https://cegm-backend.onrender.com" : "";
const API_URL = `${BASE_URL}/api/auth`;

axios.defaults.withCredentials = true;

export const useUserStore = create((set) => ({
  user: null,
  users: [],
  isAuthenticated: false,
  errorAddUser: null,
  errorEditUser: null,
  errorDeleteUser: null,
  errorChangePassword: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

  // Add User
  addUser: async (formData) => {
    set({ isLoading: true, errorAddUser: null });
    console.log("Attempting to sign up with URL:", `${API_URL}/register`);

    // Ensure role is set to Employee for new signups
    const signupData = {
      ...formData,
      role: "Employee", // Set default role
    };

    console.log("Form data:", signupData);

    try {
      const response = await axios.post(`${API_URL}/register`, signupData);
      console.log("Signup response:", response);

      if (!response.data.success) {
        throw new Error(response.data.message || "Error signing up");
      }

      set({
        user: response.data.data,
        isAuthenticated: true,
        errorAddUser: null,
        isLoading: false,
      });

      return response.data;
    } catch (error) {
      console.error("Signup error:", error.response || error);
      const errorMessage =
        error.response?.data?.message || error.message || "Error signing up";

      set({
        errorAddUser: errorMessage,
        isLoading: false,
      });

      throw new Error(errorMessage);
    }
  },

  // Get All Users
  getUsers: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/users`);
      set({ users: response.data.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || "Error fetching users");
    }
  },

  // Get User by ID
  getUserById: async (id) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/users/${id}`);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || "Error fetching user");
    }
  },

  // Edit User
  editUser: async (formData) => {
    set({ isLoading: true, errorEditUser: null });

    try {
      const response = await axios.put(
        `${API_URL}/users/${formData.id}`,
        formData
      );

      set({
        user: response.data.data,
        errorEditUser: null,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error updating user";
      set({
        errorEditUser: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  // Delete User
  deleteUser: async (id) => {
    set({ isLoading: true, errorDeleteUser: null });
    try {
      const response = await axios.delete(`${API_URL}/users/${id}`);
      set({
        users: (state) => state.users.filter((user) => user._id !== id),
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error deleting user";
      set({
        errorDeleteUser: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  // Change Password
  changePassword: async (userId, currentPassword, newPassword) => {
    set({ isLoading: true, errorChangePassword: null });
    try {
      const response = await axios.put(
        `${API_URL}/users/${userId}/change-password`,
        {
          currentPassword,
          newPassword,
        }
      );
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error changing password";
      set({
        errorChangePassword: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  // Reset state
  resetState: () => {
    set({
      user: null,
      users: [],
      isAuthenticated: false,
      errorAddUser: null,
      errorEditUser: null,
      errorDeleteUser: null,
      errorChangePassword: null,
      isLoading: false,
      isCheckingAuth: false,
      message: null,
    });
  },
}));
