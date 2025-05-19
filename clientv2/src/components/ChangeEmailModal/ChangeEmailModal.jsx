import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import { useAuthStore } from "../../store/authStore";
import emailService from "../../services/emailService";

// Custom styles for z-index management
const customStyles = {
  swalClass: {
    zIndex: 2000,
  },
  dialogClass: {
    zIndex: 1500,
  },
};

const steps = ["Verify Current Email", "Enter New Email", "Verify New Email"];

const ChangeEmailModal = ({ open, onClose }) => {
  const { user } = useAuthStore();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentEmailCode, setCurrentEmailCode] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newEmailCode, setNewEmailCode] = useState("");
  const [errors, setErrors] = useState({
    currentEmailCode: "",
    newEmail: "",
    newEmailCode: "",
    type: null, // 'error' or 'success'
  });

  // Reset all states when modal closes
  const handleClose = () => {
    setActiveStep(0);
    setCurrentEmailCode("");
    setNewEmail("");
    setNewEmailCode("");
    setErrors({
      currentEmailCode: "",
      newEmail: "",
      newEmailCode: "",
      type: null,
    });
    onClose();
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate verification code format
  const validateCode = (code) => {
    return /^\d{6}$/.test(code);
  };

  // Request verification code for current email
  const requestCurrentEmailCode = async () => {
    try {
      setLoading(true);
      const response = await emailService.requestCurrentEmailVerification(
        user.email
      );

      if (response.success) {
        // Use regular dialog message instead of Swal
        setErrors((prev) => ({
          ...prev,
          currentEmailCode: `Verification code sent to ${user.email}`,
          type: "success",
        }));
      } else {
        throw new Error(response.message || "Failed to send verification code");
      }
    } catch (error) {
      console.error("Error requesting verification code:", error);
      setErrors((prev) => ({
        ...prev,
        currentEmailCode: error.message || "Failed to send verification code",
        type: "error",
      }));
    } finally {
      setLoading(false);
    }
  };

  // Verify current email code
  const verifyCurrentEmailCode = async () => {
    if (!validateCode(currentEmailCode)) {
      setErrors((prev) => ({
        ...prev,
        currentEmailCode: "Please enter a valid 6-digit code",
        type: "error",
      }));
      return;
    }

    try {
      setLoading(true);
      await emailService.verifyCurrentEmail(user.email, currentEmailCode);

      setActiveStep(1);
      setErrors((prev) => ({ ...prev, currentEmailCode: "" }));
      // Show Swal for successful verification
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Current email verified successfully. Please enter your new email address.",
        customClass: {
          container: "swal2-container-custom",
        },
      });
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        currentEmailCode: error.message,
        type: "error",
      }));
    } finally {
      setLoading(false);
    }
  };

  // Request verification code for new email
  const handleNewEmailSubmit = async () => {
    if (!validateEmail(newEmail)) {
      setErrors((prev) => ({
        ...prev,
        newEmail: "Please enter a valid email address",
        type: "error",
      }));
      return;
    }

    if (newEmail === user.email) {
      setErrors((prev) => ({
        ...prev,
        newEmail: "New email cannot be the same as current email",
        type: "error",
      }));
      return;
    }

    try {
      setLoading(true);
      console.log("Requesting verification code for:", {
        newEmail,
        currentEmail: user.email,
      });

      const response = await emailService.requestNewEmailVerification(
        newEmail,
        user.email
      );

      if (response.success) {
        setActiveStep(2);
        setErrors((prev) => ({
          ...prev,
          newEmail: "",
          newEmailCode: `Verification code sent to ${newEmail}`,
          type: "success",
        }));
      } else {
        throw new Error(response.message || "Failed to send verification code");
      }
    } catch (error) {
      console.error("Error requesting new email verification:", error);
      setErrors((prev) => ({
        ...prev,
        newEmail: error.message,
        type: "error",
      }));
    } finally {
      setLoading(false);
    }
  };

  // Resend verification code for new email
  const resendNewEmailCode = async () => {
    try {
      setLoading(true);
      await emailService.requestNewEmailVerification(newEmail, user.email);

      // Use regular dialog message instead of Swal
      setErrors((prev) => ({
        ...prev,
        newEmailCode: `Verification code resent to ${newEmail}`,
        type: "success",
      }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        newEmailCode: error.message,
        type: "error",
      }));
    } finally {
      setLoading(false);
    }
  };

  // Complete email change process
  const completeEmailChange = async () => {
    if (!validateCode(newEmailCode)) {
      setErrors((prev) => ({
        ...prev,
        newEmailCode: "Please enter a valid 6-digit code",
        type: "error",
      }));
      return;
    }

    try {
      setLoading(true);
      console.log("Attempting to verify email change with:", {
        newEmail,
        currentEmail: user.email,
        code: newEmailCode,
      });

      const response = await emailService.completeEmailChange(
        newEmail,
        user.email,
        newEmailCode
      );

      if (response.success) {
        // Update the user state with new email first
        useAuthStore.setState((state) => ({
          user: {
            ...state.user,
            email: newEmail,
          },
        }));

        // Then show success message
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Your email has been updated successfully!",
          customClass: {
            container: "swal2-container-custom",
          },
        });

        // Finally close modal and reload
        handleClose();
        window.location.reload();
      } else {
        throw new Error(response.message || "Failed to verify email change");
      }
    } catch (error) {
      console.error("Email change verification error:", error);

      // If the error indicates no request found or expired, go back to step 1
      if (
        error.message.includes("No email change request found") ||
        error.message.includes("expired")
      ) {
        setActiveStep(1);
        setErrors((prev) => ({
          ...prev,
          newEmail: "Please request a new verification code",
          type: "error",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          newEmailCode: error.message || "Failed to verify email change",
          type: "error",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes with validation
  const handleInputChange = (e, field) => {
    const { value } = e.target;

    switch (field) {
      case "currentEmailCode":
        setCurrentEmailCode(value);
        if (value && !validateCode(value)) {
          setErrors((prev) => ({
            ...prev,
            currentEmailCode: "Please enter a valid 6-digit code",
          }));
        } else {
          setErrors((prev) => ({ ...prev, currentEmailCode: "" }));
        }
        break;

      case "newEmail":
        setNewEmail(value);
        if (value) {
          if (!validateEmail(value)) {
            setErrors((prev) => ({
              ...prev,
              newEmail: "Please enter a valid email address",
            }));
          } else if (value === user.email) {
            setErrors((prev) => ({
              ...prev,
              newEmail: "New email cannot be the same as current email",
            }));
          } else {
            setErrors((prev) => ({ ...prev, newEmail: "" }));
          }
        } else {
          setErrors((prev) => ({ ...prev, newEmail: "" }));
        }
        break;

      case "newEmailCode":
        setNewEmailCode(value);
        if (value && !validateCode(value)) {
          setErrors((prev) => ({
            ...prev,
            newEmailCode: "Please enter a valid 6-digit code",
          }));
        } else {
          setErrors((prev) => ({ ...prev, newEmailCode: "" }));
        }
        break;

      default:
        break;
    }
  };

  return (
    <>
      <style>
        {`
          .swal2-container-custom {
            z-index: 2000 !important;
          }
          .MuiDialog-root {
            z-index: 1500;
          }
        `}
      </style>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            position: "relative",
            zIndex: 1500,
          },
        }}
      >
        <DialogTitle>Change Email Address</DialogTitle>
        <DialogContent>
          <Box sx={{ width: "100%", mt: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mt: 4, mb: 2 }}>
              {activeStep === 0 && (
                <Box>
                  <Typography variant="body1" gutterBottom>
                    First, let's verify your current email address:{" "}
                    {user?.email}
                  </Typography>
                  <TextField
                    fullWidth
                    label="Verification Code"
                    value={currentEmailCode}
                    onChange={(e) => handleInputChange(e, "currentEmailCode")}
                    error={!!errors.currentEmailCode && errors.type === "error"}
                    helperText={
                      errors.currentEmailCode && (
                        <Typography
                          component="span"
                          color={
                            errors.type === "success" ? "success.main" : "error"
                          }
                        >
                          {errors.currentEmailCode}
                        </Typography>
                      )
                    }
                    margin="normal"
                    disabled={loading}
                  />
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      onClick={requestCurrentEmailCode}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : "Send Code"}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={verifyCurrentEmailCode}
                      disabled={
                        !currentEmailCode ||
                        loading ||
                        (!!errors.currentEmailCode && errors.type === "error")
                      }
                    >
                      {loading ? <CircularProgress size={24} /> : "Verify"}
                    </Button>
                  </Box>
                </Box>
              )}

              {activeStep === 1 && (
                <Box>
                  <Typography variant="body1" gutterBottom>
                    Enter your new email address
                  </Typography>
                  <TextField
                    fullWidth
                    label="New Email Address"
                    value={newEmail}
                    onChange={(e) => handleInputChange(e, "newEmail")}
                    error={!!errors.newEmail && errors.type === "error"}
                    helperText={
                      errors.newEmail && (
                        <Typography
                          component="span"
                          color={
                            errors.type === "success" ? "success.main" : "error"
                          }
                        >
                          {errors.newEmail}
                        </Typography>
                      )
                    }
                    margin="normal"
                    disabled={loading}
                  />
                  <Box
                    sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="contained"
                      onClick={handleNewEmailSubmit}
                      disabled={
                        !newEmail ||
                        loading ||
                        (!!errors.newEmail && errors.type === "error")
                      }
                    >
                      {loading ? (
                        <CircularProgress size={24} />
                      ) : (
                        "Send Verification Code"
                      )}
                    </Button>
                  </Box>
                </Box>
              )}

              {activeStep === 2 && (
                <Box>
                  <Typography variant="body1" gutterBottom>
                    Enter the verification code sent to {newEmail}
                  </Typography>
                  <TextField
                    fullWidth
                    label="Verification Code"
                    value={newEmailCode}
                    onChange={(e) => handleInputChange(e, "newEmailCode")}
                    error={!!errors.newEmailCode && errors.type === "error"}
                    helperText={
                      errors.newEmailCode && (
                        <Typography
                          component="span"
                          color={
                            errors.type === "success" ? "success.main" : "error"
                          }
                        >
                          {errors.newEmailCode}
                        </Typography>
                      )
                    }
                    margin="normal"
                    disabled={loading}
                  />
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button onClick={resendNewEmailCode} disabled={loading}>
                      {loading ? <CircularProgress size={24} /> : "Resend Code"}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={completeEmailChange}
                      disabled={
                        !newEmailCode ||
                        loading ||
                        (!!errors.newEmailCode && errors.type === "error")
                      }
                    >
                      {loading ? (
                        <CircularProgress size={24} />
                      ) : (
                        "Confirm Change"
                      )}
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChangeEmailModal;
