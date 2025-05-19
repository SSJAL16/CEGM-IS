import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import cokinsLogo from "../../assets/images/cokins_logo.png";
import styles from "./Login.module.css";
import Alert from "@mui/material/Alert";
import toast from "react-hot-toast";
import { MyContext } from "../../App";
import { TextField } from "@mui/material";
import { Button } from "@mui/material";

const ResetPassword = () => {
  const context = useContext(MyContext);

  useEffect(() => {
    context.setisHideSidebarAndHeader(true);
  }, [context]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { resetPassword, isLoading, errorResetPassword } = useAuthStore();
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await resetPassword(token, password, confirmPassword);
    toast.success("Password reset successfully, redirecting to login page...");
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <div
      className={`${styles["container"]} d-flex justify-content-center align-items-center min-vh-100`}
    >
      <div
        className={`row border ${styles["rounded-5"]} p-3 bg-white shadow ${styles["box-area"]}`}
      >
        {/* Left box */}
        <div
          className={`${styles.cokinsBox} ${styles.left_box} col-md-6 rounded-4 d-flex justify-content-center align-items-center flex-column`}
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
            <h2 className="fw-bold text-center">Reset Password</h2>
            <p className="text-center">
              Enter and confirm your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Password */}
            <TextField
              fullWidth
              size="small"
              margin="normal"
              variant="filled"
              type="password"
              label="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Confirm Password */}
            <TextField
              fullWidth
              size="small"
              margin="normal"
              variant="filled"
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errorResetPassword && (
              <Alert severity="error" className="mb-2">
                {errorResetPassword ||
                  "Something went wrong. Please try again."}
              </Alert>
            )}

            <Button
              fullWidth
              type="submit"
              disabled={isLoading}
              variant="contained"
              margin="normal"
              size="large"
            >
              {isLoading ? (
                <span
                  class="spinner-border spinner-border-sm"
                  role="status"
                ></span>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>

          <div className="header-text mt-2">
            <Link to="/login">
              <p className="text-center">
                <i className="bi bi-arrow-left me-2"></i>Back to Login
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
