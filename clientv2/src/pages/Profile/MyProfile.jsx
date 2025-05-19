import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  Card,
  Avatar,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { FaUserCircle, FaCamera } from "react-icons/fa";
import Swal from "sweetalert2";
import cloudinaryService from "../../services/cloudinaryService";
import ChangeEmailModal from "../../components/ChangeEmailModal/ChangeEmailModal";

// Import the stringToColor function
function stringToColor(string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

const Input = styled("input")({
  display: "none",
});

const AvatarWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  display: "inline-block",
  "& .MuiAvatar-root": {
    border: "4px solid #fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  "& .upload-button": {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: "36px",
    height: "36px",
    padding: 0,
    minWidth: "unset",
    borderRadius: "50%",
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
    "& svg": {
      fontSize: "1.2rem",
    },
  },
}));

const MyProfile = () => {
  const { user, updateProfile } = useAuthStore();
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    country: "",
    region: "",
    city: "",
    address: "",
    zip_code: "",
    emergency_contact_full_name: "",
    emergency_contact_number: "",
    avatar: null,
  });
  const [errors, setErrors] = useState({
    emergency_contact_full_name: "",
    emergency_contact_number: "",
  });
  const [newEmail, setNewEmail] = useState("");
  const [isEmailChangeRequested, setIsEmailChangeRequested] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        country: user.country || "",
        region: user.region || "",
        city: user.city || "",
        address: user.address || "",
        zip_code: user.zip_code || "",
        emergency_contact_full_name: user.emergency_contact_full_name || "",
        emergency_contact_number: user.emergency_contact_number || "",
        avatar: user.avatar || null,
      });
      if (user.avatar) {
        setPreviewUrl(user.avatar);
      }
    }
  }, [user]);

  const validateEmergencyContact = (name, value) => {
    let error = "";
    if (name === "emergency_contact_full_name") {
      if (!value) {
        error = "Emergency contact name is required";
      } else if (value.length < 2) {
        error = "Name must be at least 2 characters long";
      } else if (!/^[a-zA-Z\s]*$/.test(value)) {
        error = "Name should only contain letters and spaces";
      }
    } else if (name === "emergency_contact_number") {
      if (!value) {
        error = "Emergency contact number is required";
      } else if (!/^\+639\d{9}$/.test(value)) {
        error = "Phone number must start with +639 followed by 9 digits";
      }
    }
    return error;
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Please select an image less than 10MB",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "error",
          title: "Invalid File Type",
          text: "Please select an image file (JPEG, PNG, GIF)",
        });
        return;
      }

      try {
        setIsUploading(true);
        // Create a local preview URL
        const localPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(localPreviewUrl);

        // Upload to Cloudinary
        const cloudinaryUrl = await cloudinaryService.uploadImage(file);
        console.log("Cloudinary upload successful:", cloudinaryUrl);

        // Create form data for profile update
        const formData = new FormData();
        formData.append(
          "emergency_contact_full_name",
          profileData.emergency_contact_full_name || ""
        );
        formData.append(
          "emergency_contact_number",
          profileData.emergency_contact_number || ""
        );
        formData.append("avatar", cloudinaryUrl);

        // Update profile with new avatar URL
        const response = await updateProfile(formData);
        console.log("Profile update response:", response);

        if (response.success) {
          // Update local state with the new avatar URL
          setProfileData((prev) => ({
            ...prev,
            avatar: cloudinaryUrl,
          }));

          // Update preview URL
          setPreviewUrl(cloudinaryUrl);

          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Profile picture updated successfully",
          });
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: error.message || "Failed to upload image. Please try again.",
        });
        // Reset preview if upload fails
        setPreviewUrl(user?.avatar || null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleEmergencyContactChange = (e) => {
    const { name, value } = e.target;

    // For phone number, automatically add +639 prefix if not present
    let updatedValue = value;
    if (name === "emergency_contact_number") {
      if (!value.startsWith("+639") && value.length > 0) {
        updatedValue = "+639" + value.replace(/^\+639/, "");
      }
    }

    setProfileData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    // Real-time validation
    const error = validateEmergencyContact(name, updatedValue);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleEmailChange = async () => {
    let loadingSwal;
    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter an email address",
      });
      return;
    }

    if (!emailRegex.test(newEmail)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address",
      });
      return;
    }

    // Check if new email is same as current
    if (newEmail === profileData.email) {
      Swal.fire({
        icon: "error",
        title: "Invalid Request",
        text: "New email cannot be the same as your current email",
      });
      return;
    }

    try {
      // Show loading state
      loadingSwal = Swal.fire({
        title: "Sending Verification Code",
        text: "Please wait...",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      console.log("Sending email change request for:", newEmail);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/request-email-change`,
        { newEmail },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Server response:", response.data);

      // Close loading dialog
      if (loadingSwal) {
        await loadingSwal.close();
      }

      if (response.data.success) {
        setIsEmailChangeRequested(true);
        Swal.fire({
          icon: "success",
          title: "Verification Code Sent",
          text: `Please check ${newEmail} for the verification code. The code will expire in ${
            response.data.expiresIn || "10 minutes"
          }.`,
          confirmButtonText: "OK",
        });
      } else {
        throw new Error(
          response.data.message || "Failed to send verification code"
        );
      }
    } catch (error) {
      console.error("Email change request error:", error);

      // Close loading dialog if it's still open
      if (loadingSwal) {
        await loadingSwal.close();
      }

      let errorMessage = "Failed to send verification code. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Your session has expired. Please log in again.";
        // Redirect to login after showing error
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else if (error.response?.status === 429) {
        errorMessage =
          "Please wait before requesting another verification code.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || "Invalid email address.";
      } else if (!error.response) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonText: "OK",
      });
    }
  };

  const handleVerifyEmail = async () => {
    // Validate verification code
    if (!verificationCode) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please enter the verification code",
      });
      return;
    }

    // Check if code is 6 digits
    if (!/^\d{6}$/.test(verificationCode)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Code",
        text: "Verification code must be 6 digits",
      });
      return;
    }

    try {
      // Show loading state
      const loadingSwal = Swal.fire({
        title: "Verifying Code",
        text: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post("/api/auth/verify-email-change", {
        code: verificationCode,
      });

      // Close loading dialog
      await loadingSwal.close();

      if (response.data.success) {
        setIsEmailChangeRequested(false);
        setNewEmail("");
        setVerificationCode("");

        // Update both profileData and user state
        setProfileData((prev) => ({
          ...prev,
          email: response.data.user.email,
        }));

        // Update the user in the auth store
        useAuthStore.setState((state) => ({
          user: {
            ...state.user,
            email: response.data.user.email,
          },
        }));

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Email updated successfully",
          confirmButtonText: "OK",
        });
      } else {
        throw new Error(response.data.message || "Failed to verify email");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Invalid verification code";

      // If the error indicates we need to request a new code, reset the form
      if (errorMessage.includes("request a new code")) {
        setIsEmailChangeRequested(false);
        setVerificationCode("");
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const nameError = validateEmergencyContact(
      "emergency_contact_full_name",
      profileData.emergency_contact_full_name
    );
    const numberError = validateEmergencyContact(
      "emergency_contact_number",
      profileData.emergency_contact_number
    );

    if (nameError || numberError) {
      setErrors({
        emergency_contact_full_name: nameError,
        emergency_contact_number: numberError,
      });
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fix the errors before submitting",
      });
      return;
    }

    // First, show confirmation dialog
    const result = await Swal.fire({
      title: "Confirm Changes",
      text: "Are you sure you want to save these changes?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, save changes",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsUploading(true);

    // Show loading state
    Swal.fire({
      title: "Saving Changes",
      text: "Please wait...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const formData = new FormData();

    // Only append avatar if it's a new file
    if (profileData.avatar && profileData.avatar instanceof File) {
      formData.append("avatar", profileData.avatar);
    }

    formData.append(
      "emergency_contact_full_name",
      profileData.emergency_contact_full_name || ""
    );
    formData.append(
      "emergency_contact_number",
      profileData.emergency_contact_number || ""
    );

    try {
      const response = await updateProfile(formData);

      // Update preview URL with the new avatar URL from response
      if (response.user && response.user.avatar) {
        setPreviewUrl(response.user.avatar);
        // Update profileData with the new avatar URL
        setProfileData((prev) => ({
          ...prev,
          avatar: response.user.avatar,
        }));
      }

      setIsUploading(false);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Profile updated successfully",
      });
    } catch (error) {
      setIsUploading(false);
      console.error("Error updating profile:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error updating profile",
      });
    }
  };

  const getInitials = () => {
    const initials =
      (user?.first_name || "").charAt(0) + (user?.last_name || "").charAt(0);
    return initials.toUpperCase();
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push("At least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("One uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("One lowercase letter");
    }
    if (!/\d/.test(password)) {
      errors.push("One number");
    }
    if (!/[@$!%*?&]/.test(password)) {
      errors.push("One special character (@$!%*?&)");
    }
    return errors;
  };

  const handlePasswordChange = (e, field) => {
    const { value } = e.target;

    // Update the password field
    if (field === "currentPassword") {
      setCurrentPassword(value);
      setPasswordErrors((prev) => ({
        ...prev,
        currentPassword: value ? "" : "Current password is required",
      }));
    } else if (field === "newPassword") {
      setNewPassword(value);
      const validationErrors = validatePassword(value);
      setPasswordErrors((prev) => ({
        ...prev,
        newPassword:
          validationErrors.length > 0
            ? `Missing: ${validationErrors.join(", ")}`
            : "",
        // Also update confirm password error if it exists
        confirmPassword: confirmPassword
          ? confirmPassword !== value
            ? "Passwords do not match"
            : ""
          : "",
      }));
    } else if (field === "confirmPassword") {
      setConfirmPassword(value);
      setPasswordErrors((prev) => ({
        ...prev,
        confirmPassword: value !== newPassword ? "Passwords do not match" : "",
      }));
    }
  };

  const handleChangePassword = async () => {
    // Reset password errors
    setPasswordErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    // Validate password requirements
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    let hasError = false;
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!currentPassword) {
      errors.currentPassword = "Current password is required";
      hasError = true;
    }

    if (!newPassword) {
      errors.newPassword = "New password is required";
      hasError = true;
    } else if (!passwordRegex.test(newPassword)) {
      errors.newPassword =
        "Password must be at least 8 characters long with 1 uppercase, 1 lowercase, 1 number, and 1 special character";
      hasError = true;
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    if (hasError) {
      setPasswordErrors(errors);
      return;
    }

    // Show confirmation dialog
    const confirmResult = await Swal.fire({
      title: "Change Password",
      text: "Are you sure you want to change your password? You will be logged out after the change.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change password",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    try {
      // Show loading state
      const loadingSwal = Swal.fire({
        title: "Changing Password",
        text: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Call the changePassword function from auth store
      const response = await useAuthStore
        .getState()
        .changePassword(currentPassword, newPassword, confirmPassword);

      await loadingSwal.close();

      if (response.success) {
        await Swal.fire({
          icon: "success",
          title: "Password Changed Successfully",
          text: "You will be logged out now. Please log in with your new password.",
          confirmButtonText: "OK",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Clear all authentication data
        const authStore = useAuthStore.getState();
        await authStore.logout(); // This will clear the auth cookie

        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(
              /=.*/,
              "=;expires=" + new Date().toUTCString() + ";path=/"
            );
        });

        // Clear localStorage
        localStorage.clear();

        // Clear sessionStorage
        sessionStorage.clear();

        // Force reload the page to clear any remaining state
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Password change error:", error);

      const errorMessage =
        error.message || "Failed to change password. Please try again.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4">
        <h5 className="mb-0">My Profile</h5>
      </div>

      <div className="row mt-4">
        {/* Left Column - Photo Upload and Password Change */}
        <div className="col-md-4 d-flex flex-column">
          <div className="card shadow border-0 p-4 w-100 mb-4">
            <div className="text-center d-flex flex-column justify-content-center align-items-center">
              <AvatarWrapper>
                <Avatar
                  src={previewUrl || user?.avatar}
                  sx={{
                    width: 150,
                    height: 150,
                    bgcolor: stringToColor(
                      `${profileData.first_name} ${profileData.last_name}`
                    ),
                  }}
                >
                  {!previewUrl && !user?.avatar && (
                    <FaUserCircle style={{ fontSize: "4rem" }} />
                  )}
                </Avatar>
                <label htmlFor="avatar-input">
                  <Input
                    accept="image/*"
                    id="avatar-input"
                    type="file"
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                  />
                  <Button
                    component="span"
                    className="upload-button"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <FaCamera />
                    )}
                  </Button>
                </label>
              </AvatarWrapper>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{
                  mt: 3,
                  mb: 1,
                  fontSize: "0.875rem",
                  opacity: 0.8,
                }}
              >
                Allowed *.jpeg, *.jpg, *.png, *.gif
                <br />
                max size of 10 MB
              </Typography>
              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {user?.role || "User"}
              </Typography>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="card shadow border-0 p-4 w-100">
            <Typography variant="h6" sx={{ mb: 2 }}>
              Change Password
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Current Password"
                  value={currentPassword}
                  onChange={(e) => handlePasswordChange(e, "currentPassword")}
                  error={!!passwordErrors.currentPassword}
                  helperText={passwordErrors.currentPassword}
                  onPaste={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  onCopy={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  autoComplete="new-password"
                  inputProps={{
                    autoComplete: "new-password",
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e, "newPassword")}
                  error={!!passwordErrors.newPassword}
                  helperText={
                    passwordErrors.newPassword ||
                    "Password must contain at least 8 characters with uppercase, lowercase, number, and special character"
                  }
                  onPaste={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  onCopy={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  autoComplete="new-password"
                  inputProps={{
                    autoComplete: "new-password",
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => handlePasswordChange(e, "confirmPassword")}
                  error={!!passwordErrors.confirmPassword}
                  helperText={passwordErrors.confirmPassword}
                  onPaste={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  onCopy={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  autoComplete="new-password"
                  inputProps={{
                    autoComplete: "new-password",
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    onClick={handleChangePassword}
                    disabled={
                      !currentPassword ||
                      !newPassword ||
                      !confirmPassword ||
                      !!passwordErrors.currentPassword ||
                      !!passwordErrors.newPassword ||
                      !!passwordErrors.confirmPassword
                    }
                  >
                    Change Password
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </div>
        </div>

        {/* Right Column - Form Fields */}
        <div className="col-md-8 d-flex">
          <div className="card shadow border-0 p-4 w-100">
            <form onSubmit={handleSubmit} className="h-100 d-flex flex-column">
              <Grid container spacing={3} flex={1}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full name"
                    value={`${profileData.first_name} ${profileData.last_name}`}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email address"
                    value={profileData.email}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone number"
                    value={profileData.phone_number}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={profileData.country}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="State/Region"
                    value={profileData.region}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={profileData.city}
                    disabled
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={profileData.address}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Zip/Code"
                    value={profileData.zip_code}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    value={user?.company || ""}
                    disabled
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Emergency Contact Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Emergency Contact Name"
                        name="emergency_contact_full_name"
                        value={profileData.emergency_contact_full_name}
                        onChange={handleEmergencyContactChange}
                        error={!!errors.emergency_contact_full_name}
                        helperText={errors.emergency_contact_full_name}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Emergency Contact Number"
                        name="emergency_contact_number"
                        value={profileData.emergency_contact_number}
                        onChange={handleEmergencyContactChange}
                        error={!!errors.emergency_contact_number}
                        helperText={errors.emergency_contact_number}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} className="mt-auto">
                  <Grid container justifyContent="flex-end">
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={
                        !!errors.emergency_contact_full_name ||
                        !!errors.emergency_contact_number
                      }
                    >
                      Save Changes
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </form>
          </div>
        </div>
      </div>

      <div className="card shadow border-0 p-4 w-100 mb-4">
        <div className="text-center">
          <h4>Email Address</h4>
          <p className="mb-4">{user?.email}</p>
          <Button variant="contained" onClick={() => setIsEmailModalOpen(true)}>
            Change Email
          </Button>
        </div>
      </div>

      <ChangeEmailModal
        open={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />
    </div>
  );
};

export default MyProfile;
