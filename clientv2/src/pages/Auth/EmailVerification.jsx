import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import cokinsLogo from "../../assets/images/cokins_logo.png";
import styles from "./Login.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import Alert from "@mui/material/Alert";
import { MyContext } from "../../App";
import { Button, TextField, Typography } from "@mui/material";

const EmailVerification = () => {
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const [email, setEmail] = useState(
    localStorage.getItem("verificationEmail") || ""
  );

  // Add new state variables for attempt tracking
  const [wrongAttempts, setWrongAttempts] = useState(
    parseInt(localStorage.getItem("verificationAttempts") || "0")
  );
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  useEffect(() => {
    context.setisHideSidebarAndHeader(true);

    // Check for email in localStorage or redirect to login
    const storedEmail = localStorage.getItem("verificationEmail");
    if (!storedEmail) {
      toast.error("Please sign up first to verify your email");
      navigate("/login");
      return;
    }
    setEmail(storedEmail);

    // Check for existing lockout
    const lockoutEndTime = localStorage.getItem("verificationLockoutEnd");
    if (lockoutEndTime) {
      const now = Date.now();
      const endTime = parseInt(lockoutEndTime);

      if (now < endTime) {
        // Still locked out
        const remainingTime = Math.ceil((endTime - now) / 1000);
        setIsLocked(true);
        setLockoutTimer(remainingTime);
      } else {
        // Lockout has expired, clear it
        localStorage.removeItem("verificationLockoutEnd");
        localStorage.removeItem("verificationAttempts");
      }
    }

    // Show initial toast about sent verification code
    toast.success(`Verification code has been sent to ${storedEmail}`, {
      duration: 5000,
    });
  }, [context, navigate]);

  // Add effect for lockout timer
  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            localStorage.removeItem("verificationLockoutEnd");
            localStorage.removeItem("verificationAttempts");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTimer]);

  // Update localStorage when attempts change
  useEffect(() => {
    if (wrongAttempts > 0) {
      localStorage.setItem("verificationAttempts", wrongAttempts.toString());
    } else {
      localStorage.removeItem("verificationAttempts");
    }
  }, [wrongAttempts]);

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const { error, isLoading, verifyEmail, resendVerificationCode } =
    useAuthStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return; // Restrict input to numbers

    const newCode = [...code];
    newCode[index] = value;

    // Update code state
    setCode(newCode);
    setValidationError(""); // Clear validation error when user types

    // Focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Check if all digits are filled and trigger verification
    const isComplete = newCode.every(
      (digit) => digit !== "" && digit !== null && digit !== undefined
    );
    if (isComplete) {
      // Directly verify the code without validation
      const verificationCode = newCode.join("");
      verifyEmailCode(verificationCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Separate verification logic
  const verifyEmailCode = async (verificationCode) => {
    // Only check for lock if we've already had 3 failed attempts
    if (wrongAttempts >= 3 && isLocked) {
      const minutesLeft = Math.ceil(lockoutTimer / 60);
      toast.error(
        `Account is locked. Please wait ${minutesLeft} minutes before trying again.`
      );
      return;
    }

    try {
      await verifyEmail(verificationCode);
      setIsSubmitted(true);
      setIsVerified(true);
      setWrongAttempts(0);
      setIsLocked(false);
      localStorage.removeItem("verificationAttempts");
      localStorage.removeItem("verificationLockoutEnd");
      toast.success("Email verified successfully");
      localStorage.removeItem("verificationEmail");
    } catch (error) {
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);

      // Clear the code input fields
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      if (newAttempts >= 3) {
        // Lock the account only after exactly 3 failed attempts
        setIsLocked(true);
        const lockoutEndTime = Date.now() + 5 * 60 * 1000; // 5 minutes lockout
        localStorage.setItem(
          "verificationLockoutEnd",
          lockoutEndTime.toString()
        );
        setLockoutTimer(300); // 5 minutes in seconds
        toast.error(
          "Account locked. Too many invalid attempts. Please wait 5 minutes or request a new code."
        );
      } else {
        // Show remaining attempts for attempts 1 and 2
        const remainingAttempts = 3 - newAttempts;
        toast.error(
          `Invalid verification code. ${remainingAttempts} ${
            remainingAttempts === 1 ? "attempt" : "attempts"
          } remaining.`
        );
      }
    }
  };

  // Modified handleSubmit for manual verification
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const verificationCode = code.join("");
      await verifyEmailCode(verificationCode);
    },
    [code]
  );

  const handleResendCode = async () => {
    if (isLocked) {
      toast.error(
        `Please wait ${Math.ceil(
          lockoutTimer / 60
        )} minutes before trying again`
      );
      return;
    }

    try {
      await resendVerificationCode(email);
      setResendTimer(60); // Start 60-second countdown
      // Reset attempt counter when requesting new code
      setWrongAttempts(0);
      localStorage.removeItem("verificationAttempts");
      localStorage.removeItem("verificationLockoutEnd");
      setIsLocked(false);
      toast.success(`New verification code sent to ${email}`, {
        duration: 5000,
      });
    } catch (error) {
      toast.error(error.message || "Failed to resend verification code");
    }
  };

  if (!email) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div
      className={`${styles["container"]} d-flex justify-content-center align-items-center min-vh-100`}
    >
      <div
        className={`row border ${styles["rounded-5"]} p-3 bg-white shadow ${styles["box-area"]}`}
      >
        {/* Left box */}
        <div
          className={`${styles.cokinsBox} ${styles.left_box} col-md-6 rounded-4 d-flex justify-content-center align-items-center flex-column left-box`}
        >
          <div className="featured-image mb-3">
            <img
              src={cokinsLogo}
              className="img-fluid"
              style={{ width: "350px" }}
              alt="featured"
            />
          </div>
        </div>

        {/* Right box */}
        <div className={`col-md-6 ${styles["right-box"]}`}>
          <div className="header-text mb-4">
            <h2 className="fw-bold text-center">Verify Your Email</h2>
            <p className="text-center">
              Enter the 6-digit code sent to <strong>{email}</strong>
            </p>
            {wrongAttempts >= 3 && isLocked && (
              <Alert severity="warning" className="mt-2">
                Account locked. Please wait {Math.ceil(lockoutTimer / 60)}{" "}
                minutes before trying again.
              </Alert>
            )}
          </div>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              {/* Code Inputs */}
              <div className="input mb-4">
                <div className="d-flex justify-content-between gap-2">
                  {code.map((digit, index) => (
                    <TextField
                      key={index}
                      inputRef={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      inputProps={{
                        maxLength: 1,
                        style: { textAlign: "center" },
                      }}
                      variant="outlined"
                      className="text-center"
                      style={{ width: "50px", height: "50px" }}
                      error={!!validationError}
                      disabled={isLocked}
                    />
                  ))}
                </div>
                {(validationError || error) && (
                  <Alert severity="error" className="mt-3">
                    {validationError || error}
                  </Alert>
                )}
              </div>

              {/* Submit Button */}
              <Button
                fullWidth
                type="submit"
                disabled={isLoading || isLocked}
                variant="contained"
                size="large"
                className="mb-3"
              >
                {isLoading ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                  ></span>
                ) : (
                  "Verify Email"
                )}
              </Button>

              {/* Resend Code */}
              <div className="text-center mb-4">
                <Button
                  onClick={handleResendCode}
                  disabled={resendTimer > 0 || isLocked}
                  variant="text"
                  size="small"
                >
                  {isLocked
                    ? `Locked for ${Math.ceil(lockoutTimer / 60)} minutes`
                    : resendTimer > 0
                    ? `Resend code in ${resendTimer}s`
                    : "Resend verification code"}
                </Button>
              </div>
            </form>
          ) : isVerified ? (
            <div className="text-center mb-4">
              <Alert severity="success" className="mb-3">
                Your email has been verified successfully!
              </Alert>
              <Typography variant="body2" color="textSecondary">
                Please wait for admin approval before you can log in.
              </Typography>
            </div>
          ) : (
            <div className="text-center mb-4">
              <Typography variant="body2" color="textSecondary">
                If the code is correct, your email will be verified shortly.
              </Typography>
            </div>
          )}

          <div className="text-center mt-3">
            <Link to="/login" style={{ textDecoration: "none" }}>
              <Button
                startIcon={<i className="bi bi-arrow-left"></i>}
                variant="text"
                color="primary"
              >
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
