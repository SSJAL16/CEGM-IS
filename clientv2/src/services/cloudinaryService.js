import axios from "axios";

const CLOUDINARY_UPLOAD_PRESET = "cokins_preset";
const CLOUDINARY_CLOUD_NAME = "dwb5foa8m";

const cloudinaryService = {
  uploadImage: async (file) => {
    try {
      console.log("Starting image upload to Cloudinary...");
      console.log("File details:", {
        type: file.type,
        size: file.size,
        name: file.name,
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);

      // Log the request URL and data
      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
      console.log("Upload URL:", uploadUrl);
      console.log("Upload preset:", CLOUDINARY_UPLOAD_PRESET);

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        withCredentials: false,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log("Upload progress:", percentCompleted + "%");
        },
      });

      if (!response.data || !response.data.secure_url) {
        console.error("Invalid response from Cloudinary:", response.data);
        throw new Error("Invalid response from Cloudinary");
      }

      console.log("Upload successful! Response:", response.data);
      return response.data.secure_url;
    } catch (error) {
      console.error("=== Cloudinary Upload Error ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        console.error("Response headers:", error.response.headers);

        const errorMessage =
          error.response.data.error?.message ||
          error.response.data.message ||
          error.response.data.error ||
          "Failed to upload image to Cloudinary";

        throw new Error(`Cloudinary Error: ${errorMessage}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Request was made but no response received");
        console.error("Request details:", error.request);
        throw new Error(
          "Network error: No response received from Cloudinary. Please check your internet connection and Cloudinary configuration."
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", error.message);
        throw new Error(`Upload configuration error: ${error.message}`);
      }
    }
  },
};

export default cloudinaryService;
