import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api/auth"
    : "/api/auth";

// Configure axios defaults
axios.defaults.withCredentials = true;

const emailService = {
  // Request verification code for current email
  requestCurrentEmailVerification: async (email) => {
    try {
      const response = await axios.post(
        `${API_URL}/request-current-email-verification`,
        { email },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Verify current email code
  verifyCurrentEmail: async (email, code) => {
    try {
      const response = await axios.post(
        `${API_URL}/verify-current-email`,
        {
          email,
          code,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Request verification code for new email
  requestNewEmailVerification: async (newEmail, currentEmail) => {
    try {
      const response = await axios.post(
        `${API_URL}/request-email-change`,
        {
          newEmail,
          currentEmail,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Complete email change process
  completeEmailChange: async (newEmail, currentEmail, code) => {
    try {
      const response = await axios.post(
        `${API_URL}/verify-email-change`,
        {
          code,
          newEmail,
          currentEmail,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },
};

// Helper function to handle errors
const handleError = (error) => {
  if (error.response?.data?.message) {
    return new Error(error.response.data.message);
  } else if (error.response?.status === 429) {
    return new Error("Please wait before requesting another code");
  } else if (error.response?.status === 401) {
    return new Error("Please log in again to continue");
  } else if (!error.response) {
    return new Error("Network error. Please check your connection");
  }
  return new Error("An unexpected error occurred");
};

export default emailService;
